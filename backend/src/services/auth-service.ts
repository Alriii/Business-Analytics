import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { signAuthToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { generateCsrfToken, setCookieOptions, setPublicCookieOptions } from "@/lib/security";
import { owners } from "@/schema";
import { env } from "@/config/env";

export const registerOwnerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  farmName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginOwnerSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const registerOwner = async (input: z.infer<typeof registerOwnerSchema>) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await db.query.owners.findFirst({
    where: eq(owners.email, normalizedEmail),
  });

  if (existing) {
    throw new AppError("An owner with this email already exists", 409);
  }

  const passwordHash = await hash(input.password, 12);
  const [owner] = await db.insert(owners)
    .values({
      fullName: input.fullName.trim(),
      farmName: input.farmName.trim(),
      email: normalizedEmail,
      passwordHash,
    })
    .returning({
      id: owners.id,
      fullName: owners.fullName,
      farmName: owners.farmName,
      email: owners.email,
      createdAt: owners.createdAt,
    });

  return owner;
};

export const loginOwner = async (input: z.infer<typeof loginOwnerSchema>) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const owner = await db.query.owners.findFirst({
    where: eq(owners.email, normalizedEmail),
  });

  if (!owner) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await compare(input.password, owner.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = await signAuthToken(owner.id, owner.email);
  const csrfToken = generateCsrfToken();

  return {
    owner: {
      id: owner.id,
      fullName: owner.fullName,
      farmName: owner.farmName,
      email: owner.email,
      createdAt: owner.createdAt,
    },
    token,
    csrfToken,
  };
};

export const applyAuthCookies = (res: any, token: string, csrfToken: string) => {
  const secure = env.NODE_ENV === "production";
  res.cookie("authToken", token, setCookieOptions(secure));
  res.cookie("csrfToken", csrfToken, setPublicCookieOptions(secure));
};

export const clearAuthCookies = (res: any) => {
  const secure = env.NODE_ENV === "production";
  res.clearCookie("authToken", { path: "/", httpOnly: true, sameSite: "lax", secure });
  res.clearCookie("csrfToken", { path: "/", httpOnly: false, sameSite: "lax", secure });
};
