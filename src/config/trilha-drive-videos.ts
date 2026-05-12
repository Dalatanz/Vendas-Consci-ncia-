/**
 * Vídeos da trilha (Google Drive).
 * Pasta: https://drive.google.com/drive/folders/169hCDQcHZgAJ8c0M8KcecbOtJMlpAErt
 *
 * Ordem = **módulo 1 → 7** no banco: Introdução, depois Aula 01 … Aula 06.
 * (Há também Aula 07 no Drive; o app tem só 7 módulos — troque o **7º** ID na env pelo da
 * Aula 07 se quiser ela no último módulo em vez da Aula 06.)
 *
 * Em produção use `DRIVE_MODULE_VIDEO_IDS` (CSV, 7 IDs, mesma ordem).
 */
export const DRIVE_FILE_ID_BY_MODULE_ORDER: (string | null)[] = [
  "18rYoDr0Fy0OtXcIQETf8RyrGx4MEVq3-", // Introducao.mp4
  "1oCYmHg84kU4NnkYKLUKFcZgiZ0ionrLj", // Aula 01
  "1avzzC1ZkP0gxLTuc6IoXvt1lb8KL2Yww", // Aula 02
  "1yZRhH0NveDMMdu3khDPb_PddqH-i323U", // Aula 03
  "1KXkgS-N8WtcqTdLot6HLcY1ZbTQ5ZqqU", // Aula 04
  "1vPSf5Ly4ARXYT4jPDrdhNbbZESYrmKaV", // Aula 05
  "1vjaZA8CRypPzQeo266Utx2Gc_lQ8GFqP", // Aula 06 — substituir por 1cROyjO4ETmzKL8u6n0huf3Ea_hijh9NG (Aula 07) se preferir
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
