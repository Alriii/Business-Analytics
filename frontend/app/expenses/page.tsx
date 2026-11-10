"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { createExpense, deleteExpense, getExpenses, updateExpense } from "@/services/expenses.service";
import type { Expense } from "@/types";

const initialForm = { category: "Seeds", description: "", amount: 0, expenseDate: new Date().toISOString().slice(0, 16) };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const rows = await getExpenses();
      setExpenses(rows);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const runLoad = async () => {
      try {
        setLoading(true);
        const rows = await getExpenses();
        if (active) {
          setExpenses(rows);
        }
      } catch (error) {
        if (active) {
          toast.error(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void runLoad();
    return () => {
      active = false;
    };
  }, []);

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        category: form.category,
        description: form.description || undefined,
        amount: Number(form.amount),
        expenseDate: form.expenseDate ? new Date(form.expenseDate).toISOString() : undefined,
      };

      if (editingId) {
        await updateExpense(editingId, payload);
        toast.success("Expense updated.");
      } else {
        await createExpense(payload);
        toast.success("Expense added.");
      }

      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense removed.");
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <ProtectedPage>
      <AppShell title="Expenses">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Expense history</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[#78827B]">Loading expenses…</p>
              ) : expenses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9E4DA] p-8 text-center text-[#78827B]">No expenses recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-[#78827B]">
                        <th className="py-3 pr-4">Category</th>
                        <th className="py-3 pr-4">Description</th>
                        <th className="py-3 pr-4">Amount</th>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-[#F0F3F0]">
                          <td className="py-3 pr-4 font-medium">{expense.category}</td>
                          <td className="py-3 pr-4">{expense.description ?? "—"}</td>
                          <td className="py-3 pr-4">{formatCurrency(expense.amount)}</td>
                          <td className="py-3 pr-4">{formatDate(expense.expenseDate)}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => { setEditingId(expense.id); setForm({ category: expense.category, description: expense.description ?? "", amount: Number(expense.amount), expenseDate: new Date(expense.expenseDate).toISOString().slice(0, 16) }); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => void remove(expense.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit expense" : "Add expense"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))} className="flex h-11 w-full rounded-md border border-[#E5EBE5] px-3 text-sm">
                  {['Seeds','Fertilizer','Labor','Transportation','Equipment','Packaging','Other'].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((current) => ({ ...current, amount: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Expense date</Label>
                  <Input type="datetime-local" value={form.expenseDate} onChange={(e) => setForm((current) => ({ ...current, expenseDate: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => void submit()} disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save expense" : "Add expense"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={() => { setEditingId(null); setForm(initialForm); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
