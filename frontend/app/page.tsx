import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F9F6] px-6 py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/farmytrack-field.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#12251b]/55" />

      <div className="relative w-full max-w-xl rounded-3xl border border-white/25 bg-white/15 p-8 text-center shadow-xl shadow-black/10 backdrop-blur-xl sm:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-md">
          <span className="text-2xl font-semibold">F</span>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Farm management, made clear</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">FarmyTrack</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base">
          Track harvests, sales, and farm performance in one calm, organized workspace.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#245C40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4d35]"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
