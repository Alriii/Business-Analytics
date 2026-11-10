import { api, unwrapApiResponse } from "@/lib/api";
import type { Product } from "@/types";

export async function getProducts() {
  const response = await api.get("/products");
  return unwrapApiResponse<Product[]>(response.data);
}

export async function createProduct(payload: { name: string; category: string; unit: string; unitPrice: number }) {
  const response = await api.post("/products", payload);
  return unwrapApiResponse<Product>(response.data);
}

export async function updateProduct(id: string, payload: Partial<{ name: string; category: string; unit: string; unitPrice: number }>) {
  const response = await api.patch(`/products/${id}`, payload);
  return unwrapApiResponse<Product>(response.data);
}

export async function deleteProduct(id: string) {
  const response = await api.delete(`/products/${id}`);
  return unwrapApiResponse<Product>(response.data);
}
