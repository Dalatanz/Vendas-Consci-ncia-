import { cookies } from "next/headers";
import { verifyUserToken } from "@/lib/jwt";

export async function getSession() {
  const token = (await cookies()).get("uvc_token")?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export async function getUserIdOrNull() {
  const s = await getSession();
  return s?.userId ?? null;
}
