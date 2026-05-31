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

// Validation function for phone number
function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");
  // Check if at least 10 digits
  return digitsOnly.length >= 10;
}

// Validation function for future date
function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const bookingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Validation: Phone number
    if (!isValidPhone(form.phone)) {
      setMessage("Please enter a valid phone number (at least 10 digits)");
      setLoading(false);
      return;
    }

    // Validation: Future date
    if (!isFutureDate(form.appointment_date)) {
      setMessage("Please select a future date for your appointment");
      setLoading(false);
      return;
    }

    // Validation: Check if slot is already booked
    const { data: existingSlot, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", form.appointment_date)
      .eq("time_slot", form.time_slot)
      .maybeSingle();

    if (checkError) {
      setMessage(`Error checking availability: ${checkError.message}`);
      setLoading(false);
      return;
    }

    if (existingSlot) {
      setMessage("This time slot is already booked. Please choose another date or time.");
      setLoading(false);
      return;
    }

    // Insert appointment
    const { error } = await supabase.from("appointments").insert([form]);

    setLoading(false);

    if (error) {
      setMessage(`Error booking appointment: ${error.message}`);
      return;
    }

    setMessage("Appointment booked successfully! We'll contact you soon.");
    // Complete form reset
    setForm({
      customer_name: "",
      phone: "",
      service_type: "Sticker Apply",
      appointment_date: "",
      time_slot: "",
    });
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
          type="tel"
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="e.g., (123) 456-7890"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <p className="mt-1 text-xs text-gray-500">At least 10 digits required</p>
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
            min={new Date().toISOString().split('T')[0]}
            value={form.appointment_date}
            onChange={(e) =>
              setForm({ ...form, appointment_date: e.target.value })
            }
            required
          />
          <p className="mt-1 text-xs text-gray-500">Future dates only</p>
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
        <div className={`rounded-lg p-3 text-sm ${
          message.includes("Error") || message.includes("already") || message.includes("Please")
            ? "border border-red-500/20 bg-red-950/30 text-red-200"
            : "border border-emerald-500/20 bg-emerald-950/30 text-emerald-200"
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}