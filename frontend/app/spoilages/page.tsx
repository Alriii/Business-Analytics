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
import { formatDate, formatNumber, getErrorMessage } from "@/lib/utils";
import { getProducts } from "@/services/products.service";
import { createSpoilage, deleteSpoilage, getSpoilages, updateSpoilage } from "@/services/spoilages.service";
import type { Product, Spoilage } from "@/types";

const initialForm = { productId: "", quantity: 1, reason: "Overripe", recordedAt: new Date().toISOString().slice(0, 16) };

export default function SpoilagesPage() {
  const [spoilages, setSpoilages] = useState<Spoilage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [list, items] = await Promise.all([getSpoilages(), getProducts()]);
      setSpoilages(list);
      setProducts(items);
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
        const [list, items] = await Promise.all([getSpoilages(), getProducts()]);
        if (active) {
          setSpoilages(list);
          setProducts(items);
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

  const productLookup = Object.fromEntries(products.map((product) => [product.id, product]));

  const submit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        productId: form.productId,
        quantity: Number(form.quantity),
        reason: form.reason,
        recordedAt: form.recordedAt ? new Date(form.recordedAt).toISOString() : undefined,
      };

      if (editingId) {
        await updateSpoilage(editingId, payload);
        toast.success("Spoilage updated.");
      } else {
        await createSpoilage(payload);
        toast.success("Spoilage added.");
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
    if (!window.confirm("Delete this spoilage record?")) return;
    try {
      await deleteSpoilage(id);
      toast.success("Spoilage removed.");
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <ProtectedPage>
      <AppShell title="Spoilages">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Spoilage history</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[#78827B]">Loading spoilage data…</p>
              ) : spoilages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9E4DA] p-8 text-center text-[#78827B]">No spoilage records yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-[#78827B]">
                        <th className="py-3 pr-4">Product</th>
                        <th className="py-3 pr-4">Quantity</th>
                        <th className="py-3 pr-4">Reason</th>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spoilages.map((spoilage) => {
                        const product = productLookup[spoilage.productId];
                        return (
                          <tr key={spoilage.id} className="border-b border-[#F0F3F0]">
                            <td className="py-3 pr-4 font-medium">{product?.name ?? spoilage.productId}</td>
                            <td className="py-3 pr-4">{formatNumber(spoilage.quantity)} {product?.unit ?? "unit"}</td>
                            <td className="py-3 pr-4">{spoilage.reason}</td>
                            <td className="py-3 pr-4">{formatDate(spoilage.recordedAt)}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setEditingId(spoilage.id); setForm({ productId: spoilage.productId, quantity: Number(spoilage.quantity), reason: spoilage.reason, recordedAt: new Date(spoilage.recordedAt).toISOString().slice(0, 16) }); }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => void remove(spoilage.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit spoilage" : "Add spoilage"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <select value={form.productId} onChange={(e) => setForm((current) => ({ ...current, productId: e.target.value }))} className="flex h-11 w-full rounded-md border border-[#E5EBE5] px-3 text-sm">
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm((current) => ({ ...current, quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input value={form.reason} onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Recorded date</Label>
                <Input type="datetime-local" value={form.recordedAt} onChange={(e) => setForm((current) => ({ ...current, recordedAt: e.target.value }))} />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => void submit()} disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save spoilage" : "Add spoilage"}
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
