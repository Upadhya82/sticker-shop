import Link from "next/link";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Manage appointments and blocked dates
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
        >
          Back to Home
        </Link>
      </div>

      {/* Dashboard */}
      <AdminDashboard />
    </main>
  );
}
