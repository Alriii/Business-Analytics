"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Leaf, LogOut, Package2, PiggyBank, ShoppingCart, TrendingUp, Warehouse, Wheat } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDate, getErrorMessage } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/products", label: "Products", icon: Package2 },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/harvests", label: "Harvests", icon: Wheat },
  { href: "/expenses", label: "Expenses", icon: PiggyBank },
  { href: "/spoilages", label: "Spoilages", icon: Warehouse },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
];

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] text-[#23332A]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-[#E5EBE5] bg-white px-4 py-6 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-9 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0E9] text-[#245C40]">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[17px] font-semibold tracking-tight text-[#23372A]">FarmyTrack</div>
            <div className="text-xs text-[#7B877E]">Farm management</div>
          </div>
        </Link>

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A29B]">Workspace</p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active ? "bg-[#EAF2EB] text-[#245C40]" : "text-[#58665D] hover:bg-[#F5F7F4] hover:text-[#263A2D]",
                ].join(" ")}
              >
                <Icon className="h-[17px] w-[17px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-[#E6EBE6] bg-[#FAFBFA] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0E9] text-sm font-semibold text-[#245C40]">
              {user?.fullName?.trim().charAt(0).toUpperCase() ?? "F"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#2B3C31]">{user?.fullName ?? "Farm Owner"}</div>
              <div className="truncate text-xs text-[#7B877E]">{user?.farmName ?? "Your farm"}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-[#E5EBE5] bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F0E9] text-[#245C40] lg:hidden">
                <Leaf className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="hidden text-xs text-[#7B877E] sm:block">{formatDate(new Date())}</p>
                <h1 className="truncate text-xl font-semibold tracking-tight text-[#23372A] sm:mt-0.5 sm:text-[22px]">{title}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden text-right md:block">
                <div className="text-[13px] font-semibold text-[#2B3C31]">{user?.fullName ?? "Farm Owner"}</div>
                <div className="text-xs text-[#7B877E]">{user?.farmName ?? user?.email}</div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="h-9 gap-2 px-3 text-xs sm:text-sm">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
          <nav aria-label="Main navigation" className="border-t border-[#F0F2F0] px-3 py-2 lg:hidden">
            <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                      active ? "bg-[#EAF2EB] text-[#245C40]" : "text-[#657269] hover:bg-[#F5F7F4]",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        <main className="app-content mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
