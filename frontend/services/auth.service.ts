import { api, unwrapApiResponse } from "@/lib/api";
import type { Owner } from "@/types";

export async function registerOwner(payload: { fullName: string; farmName: string; email: string; password: string }) {
  const response = await api.post("/auth/register", payload);
  return unwrapApiResponse<{ id?: string }>(response.data);
}

export async function loginOwner(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  return unwrapApiResponse<{ owner: Owner; csrfToken: string }>(response.data);
}

export async function logoutOwner() {
  await api.post("/auth/logout");
}

export async function getCurrentOwner() {
  const response = await api.get("/auth/me");
  return unwrapApiResponse<Owner>(response.data);
}
