import { api, unwrapApiResponse } from "@/lib/api";
import type { Sale } from "@/types";

export async function getSales() {
  const response = await api.get("/sales");
  return unwrapApiResponse<Sale[]>(response.data);
}

export async function createSale(payload: { productId: string; quantity: number; unitPrice: number; soldAt?: string }) {
  const response = await api.post("/sales", payload);
  return unwrapApiResponse<Sale>(response.data);
}

export async function updateSale(id: string, payload: Partial<{ productId: string; quantity: number; unitPrice: number; soldAt: string }>) {
  const response = await api.patch(`/sales/${id}`, payload);
  return unwrapApiResponse<Sale>(response.data);
}

export async function deleteSale(id: string) {
  const response = await api.delete(`/sales/${id}`);
  return unwrapApiResponse<Sale>(response.data);
}
