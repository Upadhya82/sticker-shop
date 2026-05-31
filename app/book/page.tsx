import Link from "next/link";
import AppointmentForm from "@/components/AppointmentForm";

export default function BookPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Book an Appointment
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Fill the form to book your sticker service slot.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Back
          </Link>
        </div>

        <div className="mt-6">
          <AppointmentForm />
        </div>
      </section>
    </main>
  );
}