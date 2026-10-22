"use client";

import { useMemo, useState } from "react";
import { parseLocalDate } from "@/lib/date-utils";

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
  onDateClick?: (date: string) => void;
}

export default function AdminCalendar({
  appointments,
  blockedDates,
  selectedDate,
  setSelectedDate,
  onDateClick,
}: AdminCalendarProps) {
  // Navigate month independently of selectedDate
  const [navYearMonth, setNavYearMonth] = useState<string>(() => {
    const parts = selectedDate.split("-");
    return `${parts[0]}-${parts[1]}`;
  });

  const [navYear, navMonth] = navYearMonth.split("-").map(Number);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(navYear, navMonth - 1, 1);
    const daysInMonth = new Date(navYear, navMonth, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [navYear, navMonth]);

  function buildDateStr(day: number): string {
    return `${navYear}-${String(navMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const getAppointmentsForDate = (day: number) => {
    const dateStr = buildDateStr(day);
    return appointments.filter((apt) => apt.appointment_date === dateStr);
  };

  const isDateBlocked = (day: number) => {
    const dateStr = buildDateStr(day);
    return blockedDates.some((blocked) => blocked.date === dateStr);
  };

  const getBlockedReason = (day: number) => {
    const dateStr = buildDateStr(day);
    return blockedDates.find((blocked) => blocked.date === dateStr)?.reason || "";
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      navYear === now.getFullYear() &&
      navMonth === now.getMonth() + 1 &&
      day === now.getDate()
    );
  };

  const previousMonth = () => {
    const d = new Date(navYear, navMonth - 2, 1);
    setNavYearMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const nextMonth = () => {
    const d = new Date(navYear, navMonth, 1);
    setNavYearMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const monthName = parseLocalDate(`${navYear}-${String(navMonth).padStart(2, "0")}-01`).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

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

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-blue-500/50"></span> Today</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-emerald-500/50"></span> Has appointments</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-red-500/50"></span> Blocked</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full border border-white/20"></span> Selected</span>
      </div>

      {/* Day headers */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-500">
            {day}
          </div>
        ))}

        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = buildDateStr(day);
          const appts = getAppointmentsForDate(day);
          const blocked = isDateBlocked(day);
          const today = isToday(day);
          const selected = dateStr === selectedDate;
          const reason = getBlockedReason(day);

          return (
            <button
              key={dateStr}
              onClick={() => {
                setSelectedDate(dateStr);
                onDateClick?.(dateStr);
              }}
              title={blocked ? `Blocked: ${reason}` : appts.length > 0 ? `${appts.length} appointment(s)` : ""}
              className={[
                "relative flex flex-col items-center justify-center rounded-lg py-2 text-sm transition",
                selected ? "ring-2 ring-white" : "",
                today && !blocked ? "bg-blue-500/20 font-bold text-blue-300" : "",
                blocked ? "bg-red-500/20 text-red-400" : "",
                !blocked && appts.length > 0 && !today ? "bg-emerald-500/10 text-emerald-300" : "",
                !blocked && appts.length === 0 && !today ? "text-zinc-300 hover:bg-white/5" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{day}</span>
              {appts.length > 0 && (
                <span className="mt-0.5 text-xs font-semibold">{appts.length}</span>
              )}
              {blocked && <span className="mt-0.5 text-xs">✕</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
