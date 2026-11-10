import { api, unwrapApiResponse } from "@/lib/api";
import type { Spoilage } from "@/types";

export async function getSpoilages() {
  const response = await api.get("/spoilages");
  return unwrapApiResponse<Spoilage[]>(response.data);
}

export async function createSpoilage(payload: { productId: string; quantity: number; reason: string; recordedAt?: string }) {
  const response = await api.post("/spoilages", payload);
  return unwrapApiResponse<Spoilage>(response.data);
}

export async function updateSpoilage(id: string, payload: Partial<{ productId: string; quantity: number; reason: string; recordedAt: string }>) {
  const response = await api.patch(`/spoilages/${id}`, payload);
  return unwrapApiResponse<Spoilage>(response.data);
}

export async function deleteSpoilage(id: string) {
  const response = await api.delete(`/spoilages/${id}`);
  return unwrapApiResponse<Spoilage>(response.data);
}
