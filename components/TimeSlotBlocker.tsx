"use client";

import { useState } from "react";
import { convertTo24Hour, convertTo12Hour } from "@/lib/date-utils";
import { getTodayDateString } from "@/lib/date-utils";

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

    const time24h = convertTo24Hour(blockingTimeSlot);
    onBlockTimeSlot(blockingDate, time24h, blockReason);
    setBlockingDate("");
    setBlockingTimeSlot("");
    setBlockReason("");
  }

  const today = getTodayDateString();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-bold text-white">Block Time Slots</h3>
      <p className="mt-1 text-xs text-zinc-400">
        Block specific times on specific dates
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

        <div>
          <label className="text-sm text-zinc-300">Time Slot</label>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={blockingTimeSlot}
            onChange={(e) => setBlockingTimeSlot(e.target.value)}
          >
            <option value="">Select time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Reason</label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
            placeholder="e.g., Lunch break"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleBlockTimeSlot}
        disabled={loading}
        className="mt-3 w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50 sm:w-auto sm:px-6"
      >
        {loading ? "Blocking..." : "Block Time Slot"}
      </button>

      {/* Blocked time slots list */}
      {blockedTimeSlots.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <h4 className="mb-2 text-sm font-semibold text-white">
            Currently Blocked Slots ({blockedTimeSlots.length})
          </h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {blockedTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-orange-500/20 bg-orange-950/30 p-2 text-xs"
              >
                <div className="flex-1">
                  <p className="font-semibold text-orange-200">
                    {slot.date} at {convertTo12Hour(slot.time_slot)}
                  </p>
                  <p className="text-orange-300/80">{slot.reason}</p>
                </div>
                <button
                  onClick={() => onUnblockTimeSlot(slot.id)}
                  disabled={loading}
                  className="text-orange-300 hover:text-orange-200 disabled:opacity-50"
                  title="Unblock this slot"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
