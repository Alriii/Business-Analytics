import { api, unwrapApiResponse } from "@/lib/api";
import type { Harvest } from "@/types";

export async function getHarvests() {
  const response = await api.get("/harvests");
  return unwrapApiResponse<Harvest[]>(response.data);
}

export async function createHarvest(payload: { productId: string; quantity: number; harvestedAt?: string }) {
  const response = await api.post("/harvests", payload);
  return unwrapApiResponse<Harvest>(response.data);
}

export async function updateHarvest(id: string, payload: Partial<{ productId: string; quantity: number; harvestedAt: string }>) {
  const response = await api.patch(`/harvests/${id}`, payload);
  return unwrapApiResponse<Harvest>(response.data);
}

export async function deleteHarvest(id: string) {
  const response = await api.delete(`/harvests/${id}`);
  return unwrapApiResponse<Harvest>(response.data);
}
