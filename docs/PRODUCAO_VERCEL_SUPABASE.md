# Produção: Supabase + Vercel (guia completo)

Este documento descreve **pendências que foram fechadas no código** e o **passo a passo** para colocar a **Universidade Vendas Consciência** em produção.

---

## O que foi implementado (pendências funcionais)

| Área | Antes | Agora |
|------|--------|--------|
| Esqueci senha | Link `#` | Página `/esqueci-senha` + API com token e e-mail (Resend) |
| Redefinir senha | — | Página `/recuperar-senha` + API `reset-password` |
| Perfil | Botões sem ação | Formulários: **editar perfil** (PATCH) e **alterar senha** |
| Cadastro | Sem e-mail | Campo **e-mail opcional** (recomendado para recuperação) |
| Certificados / diploma | “Simulado”, sem PDF | Emissão ao **passar na avaliação**; PDF real via `pdf-lib` |
| Biblioteca | Só bloqueio | Lista via API + arquivos em `public/biblioteca/` |
| Eventos | Só placeholder | API + seed de evento ativo; contador e link quando houver `accessUrl` |
| Login com sessão | Podia ver login logado | **Middleware** redireciona para `/dashboard` |
| Deploy DB | Só `db push` | **Prisma Migrate** (`prisma/migrations`) + `migrate deploy` no build |

**Ainda dependem de serviços externos (configuração):** envio de e-mail (Resend), URL pública (`NEXT_PUBLIC_APP_URL`), banco (Supabase).

---

## 1. Supabase — criar o banco

1. Acesse [https://supabase.com](https://supabase.com) e crie um projeto.
2. Anote a **região** e a **senha** do Postgres.
3. Vá em **Project Settings → Database**.
4. Para a **aplicação na Vercel** (serverless), use a **Connection string** do **pooler** (Transaction mode / porta **6543**), no formato que o painel mostrar para **Prisma** ou “URI”.
5. Para rodar migrações **no seu computador** (opcional), use a conexão **direta** (porta **5432**) uma vez, se o pooler der problema com `migrate deploy`.

Exemplo (fictício — copie do seu painel):

```env
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 2. Variáveis de ambiente (Vercel + local)

Crie na **Vercel → Project → Settings → Environment Variables** (Production / Preview conforme desejar):

| Variável | Obrigatória | Descrição |
|----------|-------------|-------------|
| `DATABASE_URL` | **Sim** | URI Postgres (Supabase pooler recomendado para runtime). |
| `JWT_SECRET` | **Sim** | String longa e aleatória (mín. 16 caracteres). Ex.: `openssl rand -base64 48`. |
| `NEXT_PUBLIC_APP_URL` | **Sim** para recuperação de senha | URL pública do site, **sem** barra no final. Ex.: `https://seu-projeto.vercel.app` |
| `RESEND_API_KEY` | **Sim** para enviar e-mail de reset | Chave em [resend.com](https://resend.com) |
| `EMAIL_FROM` | Recomendado | Remetente verificado. Testes: `onboarding@resend.dev` |

Opcional:

| Variável | Uso |
|----------|-----|
| `DIRECT_DATABASE_URL` | Reservado para futuros scripts com conexão direta (não obrigatório no código atual). |
| `DRIVE_MODULE_VIDEO_IDS` | CSV com **7 IDs** (módulos 1→7): **Introdução**, depois **Aula 01 … Aula 06** (trecho `.../file/d/ID/view`). O app tem 7 módulos; se quiser **Aula 07** no último módulo, troque só o **7º** ID pelo da Aula 07. Pasta: [Drive](https://drive.google.com/drive/folders/169hCDQcHZgAJ8c0M8KcecbOtJMlpAErt). |

**Trilha (sequência e vídeos):** com `DRIVE_MODULE_VIDEO_IDS` preenchido, o seed e o script `npm run db:sync-videos` gravam URLs de preview do Drive. **Dentro de cada módulo**, a aula 1 fica liberada; as demais só após **marcar a aula anterior como concluída** (API e UI bloqueiam acesso direto).

Arquivo de referência local: copie `.env.example` para `.env` e preencha.

---

## 3. Primeiro deploy na Vercel

1. Suba o código no **GitHub** (branch `main`).
2. [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório.
3. **Root Directory**: raiz do app Next (onde está `package.json` deste projeto).
4. **Framework Preset**: Next.js (detectado automaticamente).
5. **Build Command** na Vercel: use **`npm run build:vercel`** (aplica `prisma migrate deploy` em banco **novo** ou com histórico de migrate).  
   Para CI/local sem migrate (banco já existente só com `db push`), use o padrão **`npm run build`**.
6. **Install Command**: `npm install` (padrão).
7. Cadastre as variáveis da tabela acima.
8. Clique em **Deploy**.

Se a build falhar em `migrate deploy`:

- Confira se `DATABASE_URL` está correto e se o IP da Vercel não está bloqueado (Supabase permite tráfego externo por padrão).
- Em banco já populado **sem** histórico de migrate, pode ser necessário um banco novo ou alinhar migrações com o suporte da equipe — o ideal é **primeiro deploy com banco vazio**.

---

## 4. Depois do primeiro deploy bem-sucedido

### 4.1 Rodar o seed (dados iniciais: módulos, aulas, recompensas, evento exemplo)

Na sua máquina (com `.env` apontando para o **mesmo** `DATABASE_URL` de produção):

```bash
cd web
npx prisma db seed
```

Isso é **idempotente** para módulos (não duplica se já existirem) e cria **evento de exemplo** se a tabela `Event` estiver vazia.

### 4.2 Resend

1. Crie conta em [resend.com](https://resend.com).
2. Para produção com domínio próprio: **Domains → Add** e configure SPF/DKIM.
3. Defina `EMAIL_FROM` com um remetente desse domínio (ou use `onboarding@resend.dev` só para testes).

### 4.3 Logo

Coloque `public/logo.png` no repositório (sua identidade visual). Sem arquivo, o `BrandLogo` usa fallback **UVC**.

---

## 5. Checklist pós-deploy

- [ ] Abrir a URL da Vercel, **cadastrar** usuário (ideal com **e-mail**).
- [ ] Login, trilha, avaliação, **certificado** em PDF.
- [ ] **Esqueci minha senha** (com `RESEND_API_KEY` + `NEXT_PUBLIC_APP_URL`).
- [ ] Biblioteca após **100% do módulo Introdução**.
- [ ] Eventos: com seed, deve aparecer **evento ativo** com contador (se `startsAt` no futuro).

---

## 6. Comandos úteis (desenvolvimento local)

```bash
npm install
cp .env.example .env   # edite DATABASE_URL e JWT_SECRET
npx prisma migrate dev   # opcional: evolui schema com novas migrações
npm run dev
```

---

## 7. Repositório de referência

- GitHub: [Dalatanz/Vendas-Consci-ncia-](https://github.com/Dalatanz/Vendas-Consci-ncia-)

---

## Resumo das rotas / APIs novas ou relevantes

- `POST /api/auth/forgot-password` — CPF → e-mail com link (Resend).
- `POST /api/auth/reset-password` — token + nova senha.
- `POST /api/auth/change-password` — autenticado.
- `PATCH /api/profile` — nome, telefone, e-mail.
- `GET /api/certificates` — lista + sincroniza com avaliações aprovadas.
- `GET /api/certificates/[id]/pdf` — PDF (`?inline=1` para visualizar).
- `GET /api/biblioteca` — arquivos liberados após intro.
- `GET /api/events` — eventos cadastrados no banco.
