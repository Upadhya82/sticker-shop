"use client";

import { formatDisplayDate, convertTo12Hour } from "@/lib/date-utils";

type Appointment = {
  id: string;
  customer_name: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  time_slot: string;
  created_at: string;
};

interface AppointmentsListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
}

export default function AppointmentsList({
  appointments,
  onDelete,
}: AppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-zinc-400">No appointments yet</p>
      </div>
    );
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
    if (dateCompare !== 0) return dateCompare;
    return a.time_slot.localeCompare(b.time_slot);
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-lg font-bold text-white">
        All Appointments ({appointments.length})
      </h3>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">Date</th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">Time</th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">Customer</th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">Phone</th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">Service</th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.map((apt) => (
              <tr
                key={apt.id}
                className="border-b border-white/5 transition hover:bg-white/5"
              >
                <td className="px-4 py-3 text-white">{formatDisplayDate(apt.appointment_date)}</td>
                <td className="px-4 py-3 text-white">{convertTo12Hour(apt.time_slot)}</td>
                <td className="px-4 py-3 text-zinc-300">{apt.customer_name}</td>
                <td className="px-4 py-3 text-zinc-300">{apt.phone}</td>
                <td className="px-4 py-3 text-zinc-300">{apt.service_type}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(apt.id)}
                    className="text-sm text-red-400 transition hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {sortedAppointments.map((apt) => (
          <div
            key={apt.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">{apt.customer_name}</p>
                <p className="mt-1 text-sm text-zinc-400">{apt.service_type}</p>
              </div>
              <button
                onClick={() => onDelete(apt.id)}
                className="text-sm text-red-400 transition hover:text-red-300"
              >
                Delete
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div>
                <span className="font-medium text-zinc-300">Date:</span>{" "}
                {formatDisplayDate(apt.appointment_date)}
              </div>
              <div>
                <span className="font-medium text-zinc-300">Time:</span>{" "}
                {convertTo12Hour(apt.time_slot)}
              </div>
              <div className="col-span-2">
                <span className="font-medium text-zinc-300">Phone:</span> {apt.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
