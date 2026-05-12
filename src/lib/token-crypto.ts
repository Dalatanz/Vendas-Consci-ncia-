import { createHash, randomBytes } from "crypto";

export function randomUrlToken() {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
