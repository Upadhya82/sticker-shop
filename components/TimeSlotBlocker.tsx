"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

type BlockedTimeSlot = {
  id: string;
  date: string;
  time_slot: string;
  reason: string;
  created_at: string;
};

type Props = {
  blockedTimeSlots: BlockedTimeSlot[];
  loading: boolean;
  message: string | null;
  onBlockTimeSlot: (date: string, timeSlot: string, reason: string) => void;
  onUnblockTimeSlot: (slotId: string) => void;
};

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

// Convert 12-hour format to 24-hour format
function convertTo24Hour(time12h: string): string {
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Convert 24-hour format back to 12-hour format for display
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

export default function TimeSlotBlocker({
  blockedTimeSlots,
  loading,
  onBlockTimeSlot,
  onUnblockTimeSlot,
}: Props) {
  const [blockingDate, setBlockingDate] = useState("");
  const [blockingTimeSlot, setBlockingTimeSlot] = useState("");
  const [blockReason, setBlockReason] = useState("");

  function handleBlockTimeSlot() {
    if (!blockingDate || !blockingTimeSlot || !blockReason.trim()) {
      alert("Please select date, time slot, and enter reason");
      return;
    }

    // Convert to 24-hour format before passing to callback
    const time24h = convertTo24Hour(blockingTimeSlot);
    onBlockTimeSlot(blockingDate, time24h, blockReason);
    setBlockingDate("");
    setBlockingTimeSlot("");
    setBlockReason("");
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-bold text-white">Block Time Slots</h3>
      <p className="mt-1 text-xs text-zinc-400">
        Block specific times on specific dates
      </p>

      <div className="mt-4 space-y-3">
        {/* Date Input */}
        <div>
          <label className="text-sm text-zinc-300">Date</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={blockingDate}
            onChange={(e) => setBlockingDate(e.target.value)}
            min={today}
          />
        </div>

        {/* Time Slot Select */}
        <div>
          <label className="text-sm text-zinc-300">Time Slot</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={blockingTimeSlot}
            onChange={(e) => setBlockingTimeSlot(e.target.value)}
          >
            <option value="">Select a time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Reason Input */}
        <div>
          <label className="text-sm text-zinc-300">Reason</label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
            placeholder="e.g., On break, Maintenance"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
        </div>

        {/* Block Button */}
        <button
          onClick={handleBlockTimeSlot}
          disabled={loading}
          className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Blocking..." : "Block Time Slot"}
        </button>
      </div>

      {/* Blocked Time Slots List */}
      <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
        <h4 className="text-sm font-semibold text-white">Blocked Slots</h4>
        {blockedTimeSlots.length === 0 ? (
          <p className="text-xs text-zinc-500">No time slots blocked</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {blockedTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-orange-500/20 bg-orange-950/30 p-2 text-xs"
              >
                <div className="flex-1">
                  <p className="font-semibold text-orange-200">
                    {new Date(slot.date).toLocaleDateString()} @ {convertTo12Hour(slot.time_slot)}
                  </p>
                  <p className="text-orange-300/80">{slot.reason}</p>
                </div>
                <button
                  onClick={() => onUnblockTimeSlot(slot.id)}
                  disabled={loading}
                  className="text-orange-300 hover:text-orange-200 disabled:opacity-50"
                  title="Unblock this time slot"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
