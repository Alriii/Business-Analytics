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

type RegisterField = "fullName" | "farmName" | "email" | "password" | "confirmPassword";
type RegisterErrors = Partial<Record<RegisterField, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    farmName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, router, user]);

  const handleChange = (field: RegisterField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: RegisterErrors = {};
    const fullName = form.fullName.trim();
    const farmName = form.farmName.trim();
    const email = form.email.trim();

    if (fullName.length < 2 || fullName.length > 100) {
      errors.fullName = "Enter a name between 2 and 100 characters.";
    }
    if (farmName.length < 2 || farmName.length > 150) {
      errors.farmName = "Enter a farm name between 2 and 150 characters.";
    }
    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address (maximum 255 characters).";
    }
    if (form.password.length < 8 || form.password.length > 128) {
      errors.password = "Password must be between 8 and 128 characters.";
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please check the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      await register({
        fullName,
        farmName,
        email,
        password: form.password,
      });
      toast.success("Registration successful. Please sign in.");
      router.push("/login");
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
      <section className="relative z-10 grid w-full max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(380px,480px)] md:gap-12">
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

        <div className="w-full max-w-[480px] justify-self-end rounded-2xl border border-white/55 bg-white/35 p-4 shadow-[0_20px_60px_rgba(9,28,18,0.20)] backdrop-blur-2xl sm:p-6">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-[#245C40] md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/85">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">FarmyTrack</span>
          </Link>
          <div className="mb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-[#202B24]">Create account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" autoComplete="name" minLength={2} maxLength={100} value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} aria-invalid={Boolean(fieldErrors.fullName)} required />
                {fieldErrors.fullName && <p className="text-xs text-red-600">{fieldErrors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm name</Label>
                <Input id="farmName" autoComplete="organization" minLength={2} maxLength={150} value={form.farmName} onChange={(e) => handleChange("farmName", e.target.value)} aria-invalid={Boolean(fieldErrors.farmName)} required />
                {fieldErrors.farmName && <p className="text-xs text-red-600">{fieldErrors.farmName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" autoComplete="email" maxLength={255} placeholder="you@example.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} aria-invalid={Boolean(fieldErrors.email)} required />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={form.password} onChange={(e) => handleChange("password", e.target.value)} aria-invalid={Boolean(fieldErrors.password)} required />
                {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} aria-invalid={Boolean(fieldErrors.confirmPassword)} required />
                {fieldErrors.confirmPassword && <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" className="mt-2 w-full rounded-xl" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[#68766D]">
            <Link href="/login" className="font-semibold text-[#245C40] hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
