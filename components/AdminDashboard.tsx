"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import AdminCalendar from "./AdminCalendar";
import AppointmentsList from "./AppointmentsList";
import TimeSlotBlocker from "./TimeSlotBlocker";

type Appointment = {
  id: string;
  customer_name: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  time_slot: string;
  created_at: string;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string;
  created_at: string;
};

type BlockedTimeSlot = {
  id: string;
  date: string;
  time_slot: string;
  reason: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<BlockedTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [blockReason, setBlockReason] = useState("");
  const [blockingDate, setBlockingDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showDateDetails, setShowDateDetails] = useState(false);

  // Load appointments and blocked dates
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load appointments
      const { data: appointmentsData, error: apptError } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (apptError) throw apptError;
      setAppointments((appointmentsData as Appointment[]) || []);

      // Load blocked dates
      const { data: blockedData, error: blockedError } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("date", { ascending: true });

      if (blockedError) throw blockedError;
      setBlockedDates((blockedData as BlockedDate[]) || []);

      // Load blocked time slots
      const { data: blockedSlotsData, error: slotsError } = await supabase
        .from("blocked_time_slots")
        .select("*")
        .order("date", { ascending: true });

      if (slotsError) throw slotsError;
      setBlockedTimeSlots((blockedSlotsData as BlockedTimeSlot[]) || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      setMessage(`❌ Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function blockDate() {
    if (!blockingDate || !blockReason.trim()) {
      setMessage("Please select a date and enter a reason");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("blocked_dates").insert({
        date: blockingDate,
        reason: blockReason.trim(),
      });

      if (error) throw error;

      setMessage("✅ Date blocked successfully");
      setBlockingDate("");
      setBlockReason("");
      await loadData();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function unblockDate(dateId: string) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", dateId);

      if (error) throw error;

      setMessage("✅ Date unblocked successfully");
      await loadData();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function blockTimeSlot(
    date: string,
    timeSlot: string,
    reason: string
  ) {
    if (!date || !timeSlot || !reason.trim()) {
      setMessage("Please select date, time slot, and enter reason");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("blocked_time_slots").insert({
        date,
        time_slot: timeSlot,
        reason: reason.trim(),
      });

      if (error) throw error;

      setMessage("✅ Time slot blocked successfully");
      await loadData();
    } catch (error: any) {
      if (error.message.includes("duplicate")) {
        setMessage("❌ This time slot is already blocked on this date");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function unblockTimeSlot(slotId: string) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("blocked_time_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      setMessage("✅ Time slot unblocked successfully");
      await loadData();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAppointment(appointmentId: string) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      setMessage("✅ Appointment deleted successfully");
      await loadData();
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleDateClick(date: string) {
    setSelectedDate(date);
    setShowDateDetails(true);
  }

  function getAppointmentsForSelectedDate() {
    return appointments.filter(apt => apt.appointment_date === selectedDate);
  }

  function convertTo12Hour(time24h: string): string {
    let [hours, minutes] = time24h.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-zinc-300">Loading admin dashboard...</p>
        <p className="mt-2 text-xs text-zinc-500">
          If this takes too long, check your Supabase connection
        </p>
      </div>
    );
  }

  // Debug info
  const debugInfo = {
    appointmentsLoaded: appointments.length,
    blockedDatesLoaded: blockedDates.length,
    blockedSlotsLoaded: blockedTimeSlots.length,
    isLoading: loading,
    timestamp: new Date().toLocaleTimeString(),
  };

  return (
    <div className="space-y-8">
      {/* Debug Info Box */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3 text-xs text-yellow-200 flex items-center justify-between">
        <p>📊 Status: {appointments.length} appointments | {blockedDates.length} blocked days | {blockedTimeSlots.length} blocked slots</p>
        <button
          onClick={() => loadData()}
          disabled={loading}
          className="rounded px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.includes("✅")
              ? "border border-emerald-500/20 bg-emerald-950/30 text-emerald-200"
              : "border border-red-500/20 bg-red-950/30 text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <AdminCalendar
            appointments={appointments}
            blockedDates={blockedDates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Block Date Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white">Block Full Day</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Prevent customers from booking on entire date
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-zinc-300">Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={blockingDate}
                onChange={(e) => setBlockingDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Reason</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
                placeholder="e.g., Holiday, Maintenance"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>

            <button
              onClick={blockDate}
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Blocking..." : "Block Full Day"}
            </button>
          </div>

          {/* Blocked Dates List */}
          <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
            <h4 className="text-sm font-semibold text-white">Blocked Full Days</h4>
            {blockedDates.length === 0 ? (
              <p className="text-xs text-zinc-500">No dates blocked</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {blockedDates.map((blockedDate) => (
                  <div
                    key={blockedDate.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-2 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-red-200">
                        {new Date(blockedDate.date).toLocaleDateString()}
                      </p>
                      <p className="text-red-300/80">{blockedDate.reason}</p>
                    </div>
                    <button
                      onClick={() => unblockDate(blockedDate.id)}
                      disabled={loading}
                      className="text-red-300 hover:text-red-200 disabled:opacity-50"
                      title="Unblock this date"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Slot Blocker Section */}
      <TimeSlotBlocker
        blockedTimeSlots={blockedTimeSlots}
        loading={loading}
        message={message}
        onBlockTimeSlot={blockTimeSlot}
        onUnblockTimeSlot={unblockTimeSlot}
      />

      {/* Date Details Modal */}
      {showDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {getAppointmentsForSelectedDate().length} appointment(s)
                </p>
              </div>
              <button
                onClick={() => setShowDateDetails(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Close ✕
              </button>
            </div>

            {/* Appointments List */}
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
              {getAppointmentsForSelectedDate().length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-zinc-400">No appointments on this date</p>
                </div>
              ) : (
                getAppointmentsForSelectedDate().map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-white">
                            {convertTo12Hour(apt.time_slot)}
                          </p>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                            {apt.service_type}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1">
                          <p className="text-sm text-zinc-300">
                            👤 <span className="font-semibold">{apt.customer_name}</span>
                          </p>
                          <p className="text-sm text-zinc-300">
                            📱 <span className="font-mono">{apt.phone}</span>
                          </p>
                          <p className="text-xs text-zinc-500">
                            Booked: {new Date(apt.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          deleteAppointment(apt.id);
                          setShowDateDetails(false);
                        }}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        title="Delete appointment"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <AppointmentsList
        appointments={appointments}
        onDelete={deleteAppointment}
      />
    </div>
  );
}
