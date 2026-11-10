import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
};

const secret = new TextEncoder().encode(env.AUTH_SECRET);

export async function signAuthToken(ownerId: string, email: string): Promise<string> {
  return new SignJWT({ sub: ownerId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid token subject");
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : "",
    iat: typeof payload.iat === "number" ? payload.iat : undefined,
    exp: typeof payload.exp === "number" ? payload.exp : undefined,
  };
}
