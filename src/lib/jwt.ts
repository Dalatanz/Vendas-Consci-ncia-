import * as jose from "jose";

const getSecret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET deve ter pelo menos 16 caracteres.");
  }
  return new TextEncoder().encode(s);
};

export async function signUserToken(userId: string) {
  return new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyUserToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret());
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    return { userId: sub };
  } catch {
    return null;
  }
}
