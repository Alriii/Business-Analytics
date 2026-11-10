import { api, unwrapApiResponse } from "@/lib/api";
import type { Expense } from "@/types";

export async function getExpenses() {
  const response = await api.get("/expenses");
  return unwrapApiResponse<Expense[]>(response.data);
}

export async function createExpense(payload: { category: string; description?: string; amount: number; expenseDate?: string }) {
  const response = await api.post("/expenses", payload);
  return unwrapApiResponse<Expense>(response.data);
}

export async function updateExpense(id: string, payload: Partial<{ category: string; description: string | null; amount: number; expenseDate: string }>) {
  const response = await api.patch(`/expenses/${id}`, payload);
  return unwrapApiResponse<Expense>(response.data);
}

export async function deleteExpense(id: string) {
  const response = await api.delete(`/expenses/${id}`);
  return unwrapApiResponse<Expense>(response.data);
}
