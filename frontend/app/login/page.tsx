"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      toast.success("Login successful. Welcome back.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-5 py-8"
      style={{ backgroundImage: "url('/farmytrack-field.jpg')" }}
    >
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-[#10281D]/25" />
      <section className="relative z-10 grid w-full max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] md:gap-12">
        <div className="hidden min-h-[420px] flex-col justify-between py-8 text-white md:flex">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">FarmyTrack</span>
          </Link>
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Grow with confidence.
          </h2>
        </div>

        <div className="w-full max-w-[380px] justify-self-end rounded-2xl border border-white/55 bg-white/35 p-5 shadow-[0_20px_60px_rgba(9,28,18,0.20)] backdrop-blur-2xl sm:p-7">
          <Link href="/" className="mb-5 inline-flex items-center gap-2 text-[#245C40] md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/85">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">FarmyTrack</span>
          </Link>
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-[#202B24]">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="mt-2 w-full rounded-xl" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#68766D]">
            <Link href="/register" className="font-semibold text-[#245C40] hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
