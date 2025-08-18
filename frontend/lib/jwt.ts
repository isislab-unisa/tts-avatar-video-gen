import * as jose from "jose";

export async function signApiToken(userId: string) {
  const secret = new TextEncoder().encode(process.env.API_JWT_SECRET!);
  return await new jose.SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("dubme-web")
    .setAudience("dubme-api")
    .setExpirationTime("5m")
    .sign(secret);
}
