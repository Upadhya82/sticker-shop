"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getTodayDateString,
  isFutureOrTodayDate,
  convertTo24Hour,
  isTimeSlotInPast,
} from "@/lib/date-utils";

type FormState = {
  customer_name: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  time_slot: string;
};

const ALL_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10;
}

export default function AppointmentForm() {
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    phone: "",
    service_type: "Sticker Apply",
    appointment_date: "",
    time_slot: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Whenever the date changes, fetch unavailable slots for that date
  useEffect(() => {
    if (!form.appointment_date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnavailableSlots([]);
      return;
    }

    async function fetchUnavailableSlots() {
      setLoadingSlots(true);
      setForm((f) => ({ ...f, time_slot: "" }));
      setMessage(null);

      try {
        // Check if date is fully blocked
        const { data: blockedDate } = await supabase
          .from("blocked_dates")
          .select("reason")
          .eq("date", form.appointment_date)
          .maybeSingle();

        if (blockedDate) {
          setMessage(`❌ This date is unavailable: ${(blockedDate as { reason: string }).reason}. Please choose another date.`);
          setUnavailableSlots(ALL_SLOTS.map(convertTo24Hour));
          setLoadingSlots(false);
          return;
        }

        // Get already-booked slots for this date
        const { data: booked } = await supabase
          .from("appointments")
          .select("time_slot")
          .eq("appointment_date", form.appointment_date);

        // Get admin-blocked time slots for this date
        const { data: blockedSlots } = await supabase
          .from("blocked_time_slots")
          .select("time_slot")
          .eq("date", form.appointment_date);

        const bookedTimes = (booked as Array<{ time_slot: string }> | null)?.map((a) => a.time_slot) ?? [];
        const blockedTimes = (blockedSlots as Array<{ time_slot: string }> | null)?.map((s) => s.time_slot) ?? [];
        setUnavailableSlots([...new Set([...bookedTimes, ...blockedTimes])]);
      } catch {
        setUnavailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchUnavailableSlots();
  }, [form.appointment_date]);

  function isSlotUnavailable(slot12h: string): boolean {
    const slot24h = convertTo24Hour(slot12h);
    // Disable past time slots for today
    if (isTimeSlotInPast(form.appointment_date, slot24h)) return true;
    return unavailableSlots.includes(slot24h);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsSuccess(false);
    setLoading(true);

    if (!isValidPhone(form.phone)) {
      setMessage("Please enter a valid phone number (at least 10 digits)");
      setLoading(false);
      return;
    }

    if (!isFutureOrTodayDate(form.appointment_date)) {
      setMessage("Please select today or a future date for your appointment");
      setLoading(false);
      return;
    }

    if (!form.time_slot) {
      setMessage("Please select a time slot");
      setLoading(false);
      return;
    }

    const time24h = convertTo24Hour(form.time_slot);

    // Final server-side double-check before inserting
    const { data: existingSlot } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", form.appointment_date)
      .eq("time_slot", time24h)
      .maybeSingle();

    if (existingSlot) {
      setMessage("This time slot was just booked. Please choose another time.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert([
      { ...form, time_slot: time24h },
    ]);

    setLoading(false);

    if (error) {
      setMessage(`Error booking appointment: ${(error as { message: string }).message}`);
      return;
    }

    setIsSuccess(true);
    setMessage("✅ Appointment booked successfully! We'll contact you soon.");
    setForm({
      customer_name: "",
      phone: "",
      service_type: "Sticker Apply",
      appointment_date: "",
      time_slot: "",
    });
    setUnavailableSlots([]);
  }

  const today = getTodayDateString();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300">Name</label>
        <input
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          placeholder="Your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Phone</label>
        <input
          type="tel"
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
          placeholder="e.g., 0712345678"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <p className="mt-1 text-xs text-zinc-500">At least 10 digits required</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">Service Type</label>
        <select
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          value={form.service_type}
          onChange={(e) => setForm({ ...form, service_type: e.target.value })}
        >
          <option value="Sticker Apply">Sticker Apply</option>
          <option value="Sticker Remove">Sticker Remove</option>
          <option value="Custom Design">Custom Design</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
            min={today}
            value={form.appointment_date}
            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
            required
          />
          <p className="mt-1 text-xs text-zinc-500">Today or future dates only</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300">Time Slot</label>
          {loadingSlots ? (
            <div className="mt-1 flex h-10 items-center rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-zinc-500">
              Checking availability...
            </div>
          ) : (
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none disabled:opacity-50"
              value={form.time_slot}
              onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
              required
              disabled={!form.appointment_date || loadingSlots}
            >
              <option value="">{form.appointment_date ? "Select a time slot" : "Pick a date first"}</option>
              {ALL_SLOTS.map((slot) => {
                const unavailable = isSlotUnavailable(slot);
                return (
                  <option key={slot} value={slot} disabled={unavailable}>
                    {slot}{unavailable ? " — Unavailable" : ""}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || loadingSlots}
        className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? "Booking..." : "Book Appointment"}
      </button>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            isSuccess
              ? "border border-emerald-500/20 bg-emerald-950/30 text-emerald-200"
              : "border border-red-500/20 bg-red-950/30 text-red-200"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
