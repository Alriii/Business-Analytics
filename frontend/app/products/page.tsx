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
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/services/products.service";
import type { Product } from "@/types";

const initialForm = { name: "", category: "", unit: "kg", unitPrice: 0 };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const rows = await getProducts();
      setProducts(rows);
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
        const rows = await getProducts();
        if (active) {
          setProducts(rows);
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

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  const submit = async () => {
    try {
      setSubmitting(true);
      if (editingId) {
        await updateProduct(editingId, form);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(form);
        toast.success("Product created successfully.");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted.");
      await loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <ProtectedPage>
      <AppShell title="Products">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product list</CardTitle>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="max-w-xs"
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-[#78827B]">Loading products…</p>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9E4DA] p-8 text-center text-[#78827B]">
                  No products yet. Add your first farm product.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-[#78827B]">
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 pr-4">Category</th>
                        <th className="py-3 pr-4">Unit</th>
                        <th className="py-3 pr-4">Unit price</th>
                        <th className="py-3 pr-4">Created</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-[#F0F3F0]">
                          <td className="py-3 pr-4 font-medium">{product.name}</td>
                          <td className="py-3 pr-4">{product.category}</td>
                          <td className="py-3 pr-4">{product.unit}</td>
                          <td className="py-3 pr-4">{formatCurrency(product.unitPrice)}</td>
                          <td className="py-3 pr-4">{formatDate(product.createdAt)}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => { setEditingId(product.id); setForm({ name: product.name, category: product.category, unit: product.unit, unitPrice: Number(product.unitPrice) }); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => void remove(product.id)}>
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
              <CardTitle>{editingId ? "Edit product" : "Add product"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product name</Label>
                <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={form.unit} onChange={(e) => setForm((current) => ({ ...current, unit: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Unit price</Label>
                  <Input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => setForm((current) => ({ ...current, unitPrice: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => void submit()} disabled={submitting} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {submitting ? (editingId ? "Saving..." : "Saving...") : editingId ? "Save changes" : "Add product"}
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
