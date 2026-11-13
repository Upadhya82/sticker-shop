export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import ReviewsList from "@/components/ReviewsList";
import CarShowcase from "@/components/CarShowcase";
type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  created_at: string;
};

export default async function Home() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: workData } = await supabase
    .from("portfolio_items")
    .select("id, title, description, image_path, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const reviews = (data ?? []) as Review[];
  const portfolioItems = ((workData ?? []) as PortfolioItem[]).map((item) => ({
    ...item,
    imageUrl: supabase.storage
      .from("shop-portfolio")
      .getPublicUrl(item.image_path).data.publicUrl,
  }));

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-400">
              RUWAN STICKER · WALASMULLA
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Ruwan Sticker
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Sticker application, removal, and custom design in Walasmulla.
              Book a time online or contact the shop directly.
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
                href="#our-work"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Our Work
              </a>

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

      <CarShowcase />

      {/* About the shop */}
      <section id="about" className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-zinc-400">ABOUT THE SHOP</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Good stickers deserve a careful finish.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
            We help with sticker application, sticker removal, and custom design work.
            Choose a service, book a time that works for you, and see examples of
            completed work below.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-xl border border-white/10 bg-black/30 p-5">
          <p className="text-sm font-semibold text-white">Services</p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>Sticker Apply</li>
            <li>Sticker Remove</li>
            <li>Custom Design</li>
          </ul>
          <Link href="/book" className="mt-2 text-sm font-semibold text-amber-300 hover:text-amber-200">
            Book a service <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Contact the shop */}
      <section id="contact" className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-widest text-zinc-400">VISIT OR CONTACT US</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Find Ruwan Sticker</h2>
        <div className="mt-5 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-white">Address</p>
            <a className="mt-1 inline-block hover:text-amber-300" href="https://www.google.com/maps/search/?api=1&query=Beliatta+Road%2C+Walasmulla%2C+82450%2C+Sri+Lanka" target="_blank" rel="noreferrer">
              Beliatta Road, Walasmulla, 82450, Sri Lanka
            </a>
          </div>
          <div>
            <p className="font-semibold text-white">Phone</p>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <a className="hover:text-amber-300" href="tel:+94717017939">+94 71 701 7939</a>
              <a className="hover:text-amber-300" href="tel:+94770217939">+94 77 021 7939</a>
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Email</p>
            <a className="mt-1 inline-block hover:text-amber-300" href="mailto:ruwankumaraads86@gmail.com">ruwankumaraads86@gmail.com</a>
          </div>
          <div>
            <p className="font-semibold text-white">Facebook</p>
            <a className="mt-1 inline-block hover:text-amber-300" href="https://www.facebook.com/RuwanStickers/" target="_blank" rel="noreferrer">Ruwan Sticker Facebook Page ↗</a>
          </div>
        </div>
      </section>

      {/* Public work gallery */}
      <section id="our-work" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-400">RECENT PROJECTS</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Our Work</h2>
            <p className="mt-1 text-sm text-zinc-400">A few examples of work completed at the shop.</p>
          </div>
          <Link href="/book" className="text-sm font-semibold text-amber-300 hover:text-amber-200">
            Book your appointment <span aria-hidden="true">→</span>
          </Link>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
            <p className="font-semibold text-zinc-200">Project photos are coming soon</p>
            <p className="mt-2 text-sm text-zinc-400">The shop owner can add completed work from the admin mobile app.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="relative aspect-[4/3] bg-black/40">
                  <Image src={item.imageUrl} alt={item.title} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  {item.description ? <p className="mt-1 line-clamp-3 text-sm leading-5 text-zinc-400">{item.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        )}
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
