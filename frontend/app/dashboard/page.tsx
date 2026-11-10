"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Boxes, CircleDollarSign, PackageCheck, Sprout, TrendingUp, Warehouse } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { farmImages } from "@/constants/farm-images";
import { useAuth } from "@/context/AuthContext";
import { getDashboard } from "@/services/analytics.service";
import { getProducts } from "@/services/products.service";
import { formatCurrency, formatDate, formatNumber, getErrorMessage } from "@/lib/utils";
import type { DashboardSummary, Product } from "@/types";

type SummaryMetric = {
  label: string;
  value: string;
  detail: string;
  icon: typeof PackageCheck;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [dashboard, productList] = await Promise.all([getDashboard(), getProducts()]);
        if (active) {
          setData(dashboard);
          setProducts(productList);
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    if (!data) return [];
    return [
      { label: "Products", value: String(data.totalProducts), detail: "in your catalog", icon: Boxes },
      { label: "Sales revenue", value: formatCurrency(data.overview.totalSalesRevenue), detail: "recorded to date", icon: CircleDollarSign },
      { label: "Harvested", value: `${formatNumber(data.overview.totalHarvestedQuantity)} kg`, detail: "total quantity", icon: Sprout },
      { label: "Spoiled", value: `${formatNumber(data.overview.totalSpoiledQuantity)} kg`, detail: "recorded quantity", icon: Warehouse },
      { label: "Expenses", value: formatCurrency(data.overview.totalRecordedExpenses), detail: "recorded to date", icon: CircleDollarSign },
      { label: "Operating profit", value: formatCurrency(data.overview.estimatedOperatingProfit), detail: "estimated", icon: TrendingUp },
    ];
  }, [data]);

  if (loading) {
    return (
      <ProtectedPage>
        <AppShell title="Overview">
          <div className="flex min-h-[300px] items-center justify-center text-sm text-[#52645A]">Loading your farm overview…</div>
        </AppShell>
      </ProtectedPage>
    );
  }

  if (error || !data) {
    return (
      <ProtectedPage>
        <AppShell title="Overview">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">We couldn’t load your farm overview.</p>
            <p className="mt-1">{error ?? "Please try again."}</p>
          </div>
        </AppShell>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <AppShell title="Overview">
        <div className="space-y-6">
          <section
            className="relative isolate flex min-h-44 items-end overflow-hidden rounded-2xl bg-cover bg-center p-6 text-white sm:min-h-52 sm:p-8"
            style={{ backgroundImage: `url('${farmImages.field}')` }}
          >
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10291D]/85 via-[#173526]/55 to-[#173526]/15" />
            <div className="max-w-xl">
              <p className="text-sm font-medium text-white/75">{user?.farmName ?? "Your farm"}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
              </h2>
              <p className="mt-2 text-sm text-white/80">A clear view of your products and farm performance.</p>
            </div>
            <Link href="/analytics" className="ml-auto hidden sm:block">
              <Button variant="secondary" className="gap-2 rounded-lg">
                View analytics <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

          <section aria-label="Farm summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {summaryMetrics.map(({ label, value, detail, icon: Icon }) => (
              <Card key={label} className="rounded-xl shadow-none">
                <CardContent className="flex min-h-28 items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="text-sm text-[#738078]">{label}</p>
                    <p className="mt-1 truncate text-xl font-semibold tracking-tight text-[#202B24]" title={value}>{value}</p>
                    <p className="mt-1 text-xs text-[#8A948D]">{detail}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#245C40]">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-3 pt-5">
                <div>
                  <CardTitle className="text-base">Sales over time</CardTitle>
                  <p className="mt-1 text-sm text-[#78827B]">Revenue from recorded sales</p>
                </div>
                <Link href="/sales" className="text-sm font-medium text-[#245C40] hover:underline">View sales</Link>
              </CardHeader>
              <CardContent className="h-72 px-3 pb-4 sm:px-5">
                {data.salesChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.salesChartData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E8EDE9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#78827B" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#78827B" }} />
                      <Tooltip
                        cursor={{ fill: "#F4F7F4" }}
                        formatter={(value) => formatCurrency(Number(Array.isArray(value) ? value[0] ?? 0 : value ?? 0))}
                      />
                      <Bar dataKey="totalRevenue" name="Revenue" fill="#397653" radius={[5, 5, 0, 0]} maxBarSize={34} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-xl bg-[#F7F9F6] px-4 text-center">
                    <TrendingUp className="h-6 w-6 text-[#81968A]" />
                    <p className="mt-3 text-sm font-medium text-[#33463A]">Sales activity will appear here</p>
                    <p className="mt-1 text-xs text-[#78827B]">Add a sale to start tracking revenue over time.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-3 pt-5">
                <div>
                  <CardTitle className="text-base">Top products</CardTitle>
                  <p className="mt-1 text-sm text-[#78827B]">Best sellers by revenue</p>
                </div>
                <Link href="/products" className="text-sm font-medium text-[#245C40] hover:underline">Products</Link>
              </CardHeader>
              <CardContent className="space-y-1 px-5 pb-5">
                {data.productPerformance.length ? (
                  data.productPerformance.slice(0, 5).map((product, index) => {
                    const unit = productById.get(product.productId)?.unit ?? "units";
                    return (
                      <div key={product.productId} className="flex items-center gap-3 border-b border-[#EDF0ED] py-3 last:border-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F1] text-xs font-semibold text-[#557261]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#26342B]">{product.productName}</p>
                          <p className="mt-0.5 text-xs text-[#78827B]">{formatNumber(product.totalQuantity)} {unit} sold</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#26342B]">{formatCurrency(product.totalRevenue)}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex min-h-44 flex-col items-center justify-center rounded-xl bg-[#F7F9F6] px-4 text-center">
                    <PackageCheck className="h-6 w-6 text-[#81968A]" />
                    <p className="mt-3 text-sm font-medium text-[#33463A]">Your products will show here</p>
                    <Link href="/products" className="mt-2 text-sm font-medium text-[#245C40] hover:underline">Add a product</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ActivityCard
              title="Recent sales"
              href="/sales"
              emptyText="No sales have been recorded yet."
            >
              {data.recentSales.map((sale) => {
                const product = productById.get(sale.productId);
                return (
                  <div key={sale.id} className="flex items-center justify-between gap-4 border-b border-[#EDF0ED] py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#26342B]">{product?.name ?? "Product"}</p>
                      <p className="mt-0.5 text-xs text-[#78827B]">{formatDate(sale.soldAt)} · {formatNumber(sale.quantity)} {product?.unit ?? "units"}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#26342B]">{formatCurrency(Number(sale.quantity) * Number(sale.unitPrice))}</p>
                  </div>
                );
              })}
            </ActivityCard>

            <ActivityCard
              title="Recent harvests"
              href="/harvests"
              emptyText="No harvests have been recorded yet."
            >
              {data.recentHarvests.map((harvest) => {
                const product = productById.get(harvest.productId);
                return (
                  <div key={harvest.id} className="flex items-center justify-between gap-4 border-b border-[#EDF0ED] py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#26342B]">{product?.name ?? "Product"}</p>
                      <p className="mt-0.5 text-xs text-[#78827B]">{formatDate(harvest.harvestedAt)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#26342B]">
                      {formatNumber(harvest.quantity)} {product?.unit ?? "units"}
                    </p>
                  </div>
                );
              })}
            </ActivityCard>
          </section>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}

function ActivityCard({
  title,
  href,
  emptyText,
  children,
}: {
  title: string;
  href: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-2 pt-5">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-[#245C40] hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {hasItems ? children : <p className="py-6 text-sm text-[#78827B]">{emptyText}</p>}
      </CardContent>
    </Card>
  );
}
