"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatNumber, getErrorMessage } from "@/lib/utils";
import { getProducts } from "@/services/products.service";
import { createHarvest, deleteHarvest, getHarvests, updateHarvest } from "@/services/harvests.service";
import type { Harvest, Product } from "@/types";

const initialForm = { productId: "", quantity: 1, harvestedAt: new Date().toISOString().slice(0, 16) };

export default function HarvestsPage() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [list, items] = await Promise.all([getHarvests(), getProducts()]);
      setHarvests(list);
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
        const [list, items] = await Promise.all([getHarvests(), getProducts()]);
        if (active) {
          setHarvests(list);
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
        harvestedAt: form.harvestedAt ? new Date(form.harvestedAt).toISOString() : undefined,
      };

      if (editingId) {
        await updateHarvest(editingId, payload);
        toast.success("Harvest updated.");
      } else {
        await createHarvest(payload);
        toast.success("Harvest added.");
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
    if (!window.confirm("Delete this harvest record?")) return;
    try {
      await deleteHarvest(id);
      toast.success("Harvest removed.");
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <ProtectedPage>
      <AppShell title="Harvests">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Harvest history</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[#78827B]">Loading harvests…</p>
              ) : harvests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9E4DA] p-8 text-center text-[#78827B]">No harvest records yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-[#78827B]">
                        <th className="py-3 pr-4">Product</th>
                        <th className="py-3 pr-4">Quantity</th>
                        <th className="py-3 pr-4">Date</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harvests.map((harvest) => {
                        const product = productLookup[harvest.productId];
                        return (
                          <tr key={harvest.id} className="border-b border-[#F0F3F0]">
                            <td className="py-3 pr-4 font-medium">{product?.name ?? harvest.productId}</td>
                            <td className="py-3 pr-4">{formatNumber(harvest.quantity)} {product?.unit ?? "unit"}</td>
                            <td className="py-3 pr-4">{formatDate(harvest.harvestedAt)}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setEditingId(harvest.id); setForm({ productId: harvest.productId, quantity: Number(harvest.quantity), harvestedAt: new Date(harvest.harvestedAt).toISOString().slice(0, 16) }); }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => void remove(harvest.id)}>
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
              <CardTitle>{editingId ? "Edit harvest" : "Add harvest"}</CardTitle>
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
                <Label>Harvest date</Label>
                <Input type="datetime-local" value={form.harvestedAt} onChange={(e) => setForm((current) => ({ ...current, harvestedAt: e.target.value }))} />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => void submit()} disabled={submitting} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {submitting ? "Saving..." : editingId ? "Save harvest" : "Add harvest"}
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
