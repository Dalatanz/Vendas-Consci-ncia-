/**
 * Vídeos da trilha (Google Drive).
 * Pasta de referência: https://drive.google.com/drive/folders/169hCDQcHZgAJ8c0M8KcecbOtJMlpAErt
 *
 * Para cada módulo (ordem 1–7), informe o ID do arquivo no Drive (trecho .../file/d/ESTE_ID/view).
 * Ordem sugerida: M1 Introducao.mp4, M2 Aula 01 … M7 Aula 06 (Aula 07 pode substituir um deles).
 * Deixe null para usar o vídeo de demonstração (MDN) naquele módulo.
 *
 * Em produção prefira a env DRIVE_MODULE_VIDEO_IDS (CSV de 7 IDs) na Vercel.
 */
export const DRIVE_FILE_ID_BY_MODULE_ORDER: (string | null)[] = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

const SAMPLE =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function lessonVideoUrlForModule(moduleOrder: number): string {
  const fromEnv = parseDriveIdsFromEnv();
  const id =
    fromEnv[moduleOrder - 1] ??
    DRIVE_FILE_ID_BY_MODULE_ORDER[moduleOrder - 1] ??
    null;
  if (id && id.length > 5) {
    return googleDrivePreviewUrl(id);
  }
  return SAMPLE;
}

export function parseDriveIdsFromEnv(): string[] {
  const raw = process.env.DRIVE_MODULE_VIDEO_IDS?.trim();
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function googleDrivePreviewUrl(fileId: string) {
  const id = fileId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function isGoogleDriveEmbedUrl(url: string) {
  return url.includes("drive.google.com") && url.includes("/preview");
}
