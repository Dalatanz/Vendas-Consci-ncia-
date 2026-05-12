# Prompt / guia: Supabase + deploy na Vercel

Guia **completo e atualizado** (variáveis, checklist, o que foi fechado no código): veja **`docs/PRODUCAO_VERCEL_SUPABASE.md`**.

Use o texto abaixo como **prompt** para outro assistente ou como **checklist** manual.

---

## Prompt (copiar e colar)

```
Tenho um projeto Next.js 16 (App Router) na raiz do repositório, com Prisma 7 + PostgreSQL via driver `pg` e `@prisma/adapter-pg`. Variáveis necessárias: DATABASE_URL e JWT_SECRET (mínimo 16 caracteres).

Quero:
1) Criar um projeto no Supabase (PostgreSQL).
2) Obter a connection string adequada ao Prisma em ambiente serverless (Vercel): usar o Connection Pooler (porta 6543) com parâmetros compatíveis com PgBouncer. Se o Prisma reclamar de prepared statements, usar a string que a documentação atual do Supabase recomenda para Prisma + pooler.
3) Aplicar o schema ao banco: a partir da minha máquina, com DATABASE_URL apontando para o Supabase, rodar `npx prisma db push` e depois `npx prisma db seed` (o seed está em prisma/seed.ts e o comando está em prisma.config.ts → migrations.seed).
4) Fazer deploy na Vercel: importar o repositório GitHub, Framework Preset Next.js, Root Directory na raiz do repo (onde está o package.json), Build Command `npm run build:vercel` na primeira vez (roda `prisma migrate deploy` + `next build`) com banco Postgres vazio; depois pode usar `npm run build` se preferir. Variáveis: DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_APP_URL, RESEND_API_KEY, EMAIL_FROM.
5) Confirmar que a build na Vercel não tenta conectar ao DB em build-time de forma desnecessária; apenas em runtime nas API routes.

Me dê os passos clicáveis no dashboard do Supabase e da Vercel, o formato exato das variáveis, e alertas comuns (SSL, IPv6, pooler vs direct connection para migrate).
```

---

## Passo a passo resumido (você mesmo)

### 1. GitHub

Repositório: [Dalatanz/Vendas-Consci-ncia-](https://github.com/Dalatanz/Vendas-Consci-ncia-)

Se o `git push` falhar por autenticação, use **Personal Access Token** (GitHub → Settings → Developer settings → Fine-grained ou classic token) como senha no HTTPS, ou configure **SSH**.

### 2. Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**.
2. Anote a **região** e a **senha** do banco.
3. No projeto: **Project Settings** → **Database**.
4. Em **Connection string**:
   - Para **aplicação em serverless (Vercel)**: use **Transaction pooler** (URI com porta **6543**), modo adequado ao Prisma. Copie a URI e ajuste a senha se o template usar `[YOUR-PASSWORD]`.
   - Para **primeira carga do schema pelo seu PC** (recomendado): use **Direct connection** (porta **5432**) no `.env` local só para rodar `db push` / `migrate`, evitando surpresas com PgBouncer; depois na Vercel use a string do **pooler**.

Exemplo de variáveis (valores fictícios — use as da sua conta):

```env
# Local (direct) — bom para prisma db push
DATABASE_URL="postgresql://postgres.xxxxx:SUASENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Vercel (pooler / transaction mode — use o que o painel do Supabase indicar para Prisma)
DATABASE_URL="postgresql://postgres.xxxxx:SUASENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

5. No seu computador, na pasta do projeto:

```bash
cp .env.example .env
# Edite .env com DATABASE_URL (direct) e JWT_SECRET

npx prisma db push
npx prisma db seed
```

### 3. Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importe `Dalatanz/Vendas-Consci-ncia-`.
2. **Root Directory**: deixe na raiz (onde está `package.json` do Next).
3. **Environment Variables**:
   - `DATABASE_URL` = string do **pooler** (produção).
   - `JWT_SECRET` = string longa e aleatória (ex.: 32+ caracteres).
4. **Deploy**. Na primeira vez, se o build passar mas o site falhar em runtime, confira se `DATABASE_URL` na Vercel está com SSL/host corretos conforme o painel do Supabase.

### 4. Depois do deploy

- Acesse a URL `.vercel.app`.
- Crie conta em `/cadastro` e faça login em `/login`.

### Referências

- [Supabase: Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel: Environment Variables](https://vercel.com/docs/projects/environment-variables)
- Repositório: [https://github.com/Dalatanz/Vendas-Consci-ncia-.git](https://github.com/Dalatanz/Vendas-Consci-ncia-.git)
