"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type FormState = {
  customer_name: string;
  phone: string;
  service_type: string;
  appointment_date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "10:00"
};

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.from("appointments").insert([form]);

    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Appointment booked successfully!");
    setForm((f) => ({ ...f, phone: "", customer_name: "", time_slot: "" }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Service Type</label>
        <select
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.service_type}
          onChange={(e) => setForm({ ...form, service_type: e.target.value })}
        >
          <option>Sticker Apply</option>
          <option>Sticker Remove</option>
          <option>Custom Design</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.appointment_date}
            onChange={(e) =>
              setForm({ ...form, appointment_date: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Time Slot</label>
          <input
            type="time"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.time_slot}
            onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Booking..." : "Book Appointment"}
      </button>

      {message && (
        <p className="text-sm text-gray-700">
          {message}
        </p>
      )}
    </form>
  );
}