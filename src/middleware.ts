import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyUserToken } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("uvc_token")?.value;
  let authed = false;
  if (token) {
    const v = await verifyUserToken(token);
    authed = Boolean(v?.userId);
  }
  const path = req.nextUrl.pathname;
  if (
    authed &&
    (path === "/login" ||
      path === "/cadastro" ||
      path === "/esqueci-senha" ||
      path === "/recuperar-senha")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/cadastro", "/esqueci-senha", "/recuperar-senha"],
};
