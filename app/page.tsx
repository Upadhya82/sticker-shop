import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import ReviewsList from "@/components/ReviewsList";

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
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sticker Shop</h1>
          <p className="mt-1 text-sm text-gray-400">
            Book your slot and leave a review.
          </p>
        </div>

        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Book Appointment
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-gray-800 p-5">
        <h2 className="text-xl font-semibold">Shop Rating</h2>

        {error ? (
          <pre className="mt-3 rounded bg-red-950/40 p-3 text-xs text-red-200">
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : (
          <div className="mt-3 flex items-end gap-3">
            <div className="text-4xl font-bold">{avg.toFixed(1)}</div>
            <div className="pb-1 text-sm text-gray-400">
              out of 5 • {reviews.length} review(s)
            </div>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Latest Reviews</h2>
        <div className="mt-3">
          <ReviewsList reviews={reviews} />
        </div>
      </section>
    </main>
  );
}