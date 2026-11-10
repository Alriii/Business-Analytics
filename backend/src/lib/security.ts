import { randomBytes } from "node:crypto";

export const generateCsrfToken = () => randomBytes(32).toString("hex");

export const setCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const setPublicCookieOptions = (secure: boolean) => ({
  httpOnly: false,
  sameSite: "lax" as const,
  secure,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
