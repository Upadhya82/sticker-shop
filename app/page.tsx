import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export default async function Home() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const reviews = (data ?? []) as Review[];

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-400">
              STICKER SERVICE
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Sticker Shop
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Book your slot, get your sticker applied, and leave a review after
              the service.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Book Appointment
              </Link>

              <Link
                href="/review"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Leave a Review
              </Link>

              <a
                href="#reviews"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                View Reviews
              </a>
              
            </div>
          </div>

          {/* Rating card */}
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-6">
            <p className="text-sm font-semibold text-zinc-200">Shop Rating</p>

            {error ? (
              <pre className="mt-3 overflow-auto rounded-lg bg-red-950/40 p-3 text-xs text-red-200">
                {JSON.stringify(error, null, 2)}
              </pre>
            ) : (
              <div className="mt-4 flex items-end gap-3">
                <div className="text-5xl font-extrabold tabular-nums">
                  {avg.toFixed(1)}
                </div>
                <div className="pb-1 text-sm text-zinc-400">
                  out of 5 • {reviews.length} review(s)
                </div>
              </div>
            )}

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                style={{ width: `${Math.min(100, (avg / 5) * 100)}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Rating is calculated from the latest reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest Reviews</h2>
            <p className="mt-1 text-sm text-zinc-400">
              What customers say about our service.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <ReviewsList reviews={reviews} />
        </div>
      </section>
    </main>
  );
}