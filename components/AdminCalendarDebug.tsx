"use client";

import { useMemo } from "react";

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

interface AdminCalendarProps {
  appointments: Appointment[];
  blockedDates: BlockedDate[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export default function AdminCalendar({
  appointments,
  blockedDates,
  selectedDate,
  setSelectedDate,
}: AdminCalendarProps) {
  // Debug logging
  if (typeof window !== "undefined") {
    console.log("🔍 AdminCalendar Debug Info:");
    console.log("📅 selectedDate:", selectedDate);
    console.log("📊 appointments count:", appointments.length);
    console.log("📊 appointments data:", appointments);
    console.log("🚫 blockedDates count:", blockedDates.length);
    console.log("🚫 blockedDates data:", blockedDates);
  }

  const dateParts = selectedDate.split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const currentDate = new Date(`${year}-${month}-01`);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const getAppointmentsForDate = (day: number) => {
    const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
    const result = appointments.filter((apt) => {
      const match = apt.appointment_date === dateStr;
      if (match) {
        console.log(`✅ Match found for ${dateStr}:`, apt.customer_name);
      }
      return match;
    });
    return result;
  };

  const isDateBlocked = (day: number) => {
    const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
    return blockedDates.some((blocked) => blocked.date === dateStr);
  };

  const getBlockedReason = (day: number) => {
    const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
    return blockedDates.find((blocked) => blocked.date === dateStr)?.reason || "";
  };

  const previousMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedDate(prev.toISOString().split("T")[0].slice(0, 7) + "-01");
  };

  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setSelectedDate(next.toISOString().split("T")[0].slice(0, 7) + "-01");
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
          >
            ← Prev
          </button>
          <button
            onClick={nextMonth}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-950/30 p-2 text-xs text-yellow-200">
        <p>📊 Appointments: {appointments.length} | 🚫 Blocked: {blockedDates.length}</p>
      </div>

      {/* Day Headers */}
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-400">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Days */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div key={`empty-${index}`} className="aspect-square" />
            );
          }

          const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
          const dayAppointments = getAppointmentsForDate(day);
          const blocked = isDateBlocked(day);
          const blockedReason = getBlockedReason(day);
          const isToday =
            dateStr === new Date().toISOString().split("T")[0];

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg p-1 text-xs font-semibold transition ${
                blocked
                  ? "border-2 border-red-500 bg-red-950/50"
                  : isToday
                  ? "border-2 border-blue-500 bg-blue-950/50"
                  : dayAppointments.length > 0
                  ? "border-2 border-emerald-500 bg-emerald-950/50"
                  : "border border-white/10 bg-white/5 hover:bg-white/10"
              }`}
              title={
                blocked
                  ? `Blocked: ${blockedReason}`
                  : dayAppointments.length > 0
                  ? `${dayAppointments.length} appointment(s)`
                  : ""
              }
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-white">{day}</span>
                {blocked && <span className="text-red-300">🚫</span>}
                {dayAppointments.length > 0 && (
                  <span className="text-emerald-300">
                    {dayAppointments.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-400 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border-2 border-emerald-500 bg-emerald-950/50" />
          <span>Appointments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border-2 border-red-500 bg-red-950/50" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border-2 border-blue-500 bg-blue-950/50" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
