"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CircleDollarSign, TrendingUp, Wheat } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, getErrorMessage } from "@/lib/utils";
import { getDashboard, getForecast, getOverview, getRecommendations } from "@/services/analytics.service";
import type { DashboardSummary } from "@/types";

type OverviewResponse = {
  totalSalesRevenue: number;
  totalSalesQuantity: number;
  totalHarvestedQuantity: number;
  totalSpoiledQuantity: number;
  totalRecordedExpenses: number;
  estimatedOperatingProfit: number;
  currentEstimatedUsableStock: number;
  spoilageRate: number;
};

type ForecastItem = {
  productId: string;
  productName: string;
  predictedDemand: number | null;
  forecastPeriod: string;
  availableData: number;
  insufficientHistoricalData: boolean;
  note: string;
  weeksUsed: Array<{ weekStart: string; totalQuantity: number }>;
};

type RecommendationItem = {
  productId: string;
  productName: string;
  predictedDemand: number;
  availableUsableStock: number;
  recommendedHarvest: number;
  needsMoreData: boolean;
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [overviewData, dashboardData, forecastData, recommendationData] = await Promise.all([
          getOverview(),
          getDashboard(),
          getForecast(),
          getRecommendations(),
        ]);

        if (!active) return;

        setOverview(overviewData);
        setDashboard(dashboardData);
        setForecast(forecastData.forecast ?? []);
        setRecommendations(recommendationData.recommendations ?? []);
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

  const expenseChart = useMemo(() => {
    const byCategory = (dashboard?.overview as { expenseBreakdown?: Array<{ category: string; totalAmount: number }> } | undefined)?.expenseBreakdown ?? [];
    return byCategory.length ? byCategory : [];
  }, [dashboard]);

  const chartColors = ["#245C40", "#3D8059", "#D99B35", "#D9534F", "#6C8F7B", "#2F5A4E"];

  if (loading) {
    return (
      <ProtectedPage>
        <AppShell title="Analytics">
          <div className="flex min-h-[220px] items-center justify-center text-[#245C40]">Loading analytics…</div>
        </AppShell>
      </ProtectedPage>
    );
  }

  if (error || !overview || !dashboard) {
    return (
      <ProtectedPage>
        <AppShell title="Analytics">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error ?? "Unable to load analytics data."}</div>
        </AppShell>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <AppShell title="Analytics">
        <div className="space-y-10">
          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3D8059]">Descriptive analytics</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#202B24]">What happened?</h2>
              <p className="mt-1 text-sm text-[#78827B]">A snapshot of your farm’s recorded performance.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total revenue", value: formatCurrency(overview.totalSalesRevenue), icon: CircleDollarSign },
                { label: "Units sold", value: formatNumber(overview.totalSalesQuantity), icon: TrendingUp },
                { label: "Harvested quantity", value: formatNumber(overview.totalHarvestedQuantity), icon: Wheat },
                { label: "Spoiled quantity", value: formatNumber(overview.totalSpoiledQuantity), icon: AlertTriangle },
                { label: "Total expenses", value: formatCurrency(overview.totalRecordedExpenses), icon: CircleDollarSign },
                { label: "Operating profit", value: formatCurrency(overview.estimatedOperatingProfit), icon: TrendingUp },
                { label: "Estimated usable stock", value: formatNumber(overview.currentEstimatedUsableStock), icon: Wheat },
                { label: "Spoilage rate", value: `${formatNumber(overview.spoilageRate)}%`, icon: AlertTriangle },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
                  <CardContent className="flex min-h-28 items-center justify-between gap-3 p-5">
                    <div>
                      <p className="text-xs font-medium text-[#78827B]">{label}</p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-[#202B24]">{value}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#245C40]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3D8059]">Performance trends</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#202B24]">Explore your records</h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue over time</CardTitle>
                </CardHeader>
                <CardContent className="h-72 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboard.salesChartData ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5EBE5" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(Array.isArray(value) ? value[0] ?? 0 : value ?? 0))}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line type="monotone" dataKey="totalRevenue" stroke="#245C40" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales by product</CardTitle>
                </CardHeader>
                <CardContent className="h-72 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard.productPerformance ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5EBE5" />
                      <XAxis dataKey="productName" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatCurrency(Number(Array.isArray(value) ? value[0] ?? 0 : value ?? 0))} />
                      <Bar dataKey="totalRevenue" fill="#3D8059" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Harvest quantities</CardTitle>
                </CardHeader>
                <CardContent className="h-72 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard?.recentHarvests ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5EBE5" />
                      <XAxis
                        dataKey="harvestedAt"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value: string) => new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatNumber(Number(Array.isArray(value) ? value[0] ?? 0 : value ?? 0))} />
                      <Bar dataKey="quantity" fill="#245C40" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expenses by category</CardTitle>
                </CardHeader>
                <CardContent className="h-72 pt-2">
                  {expenseChart.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expenseChart} dataKey="totalAmount" nameKey="category" innerRadius={45} outerRadius={90} paddingAngle={4}>
                          {expenseChart.map((entry: { category: string; totalAmount: number }, index: number) => (
                            <Cell key={`${entry.category}-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(Array.isArray(value) ? value[0] ?? 0 : value ?? 0))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#78827B]">No expense data available.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3D8059]">Predictive analytics</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#202B24]">What is likely to happen?</h2>
              <p className="mt-1 text-sm text-[#78827B]">Demand estimates use recent completed weeks of recorded sales.</p>
            </div>
            <Card className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Product demand forecast</CardTitle>
              </CardHeader>
              <CardContent>
                {forecast.length === 0 ? (
                  <p className="text-sm text-[#78827B]">Not enough historical sales data to calculate forecast demand yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-[#78827B]">
                          <th className="py-3 pr-4">Product</th>
                          <th className="py-3 pr-4">Week 1</th>
                          <th className="py-3 pr-4">Week 2</th>
                          <th className="py-3 pr-4">Week 3</th>
                          <th className="py-3 pr-4">Predicted demand</th>
                          <th className="py-3 pr-4">Forecast period</th>
                          <th className="py-3 pr-4">Data available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.map((row) => (
                          <tr key={row.productId} className="border-b border-[#F0F3F0]">
                            <td className="py-3 pr-4 font-medium">{row.productName}</td>
                            <td className="py-3 pr-4">{row.weeksUsed[0] ? formatNumber(row.weeksUsed[0].totalQuantity) : "—"}</td>
                            <td className="py-3 pr-4">{row.weeksUsed[1] ? formatNumber(row.weeksUsed[1].totalQuantity) : "—"}</td>
                            <td className="py-3 pr-4">{row.weeksUsed[2] ? formatNumber(row.weeksUsed[2].totalQuantity) : "—"}</td>
                            <td className="py-3 pr-4">{row.predictedDemand === null ? "Insufficient data" : formatNumber(row.predictedDemand)}</td>
                            <td className="py-3 pr-4">{row.forecastPeriod}</td>
                            <td className="py-3 pr-4">{row.insufficientHistoricalData ? `${row.availableData} of 3 weeks` : "Sufficient"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </section>

          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3D8059]">Prescriptive analytics</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#202B24]">What should we do?</h2>
              <p className="mt-1 text-sm text-[#78827B]">Recommendations compare predicted demand with estimated usable stock.</p>
            </div>
            <Card className="rounded-2xl border-[#E8EDE8] shadow-sm shadow-[#202B24]/[0.03]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Harvest recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length === 0 ? (
                  <p className="text-sm text-[#78827B]">No harvest recommendation is available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((item) => (
                      <div key={item.productId} className="rounded-xl border border-[#E8EDE8] bg-[#FCFDFC] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium text-[#202B24]">{item.productName}</div>
                          <div className="text-sm text-[#245C40]">{item.recommendedHarvest > 0 ? `Add ${formatNumber(item.recommendedHarvest)}` : "No additional harvest needed"}</div>
                        </div>
                        <div className="mt-2 grid gap-2 text-sm text-[#78827B] sm:grid-cols-2">
                          <div>Predicted demand: {formatNumber(item.predictedDemand)}</div>
                          <div>Usable stock: {formatNumber(item.availableUsableStock)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>
      </AppShell>
    </ProtectedPage>
  );
}
