"use client";

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

  // Sort by date and time
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
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">
                Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">
                Time
              </th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">
                Customer
              </th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">
                Phone
              </th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">
                Service
              </th>
              <th className="px-4 py-2 text-left font-semibold text-zinc-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.map((apt) => (
              <tr
                key={apt.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="px-4 py-3 text-white">
                  {new Date(apt.appointment_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-white">{convertTo12Hour(apt.time_slot)}</td>
                <td className="px-4 py-3 text-zinc-300">{apt.customer_name}</td>
                <td className="px-4 py-3 text-zinc-300">{apt.phone}</td>
                <td className="px-4 py-3 text-zinc-300">{apt.service_type}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(apt.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition"
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
      <div className="md:hidden space-y-3">
        {sortedAppointments.map((apt) => (
          <div
            key={apt.id}
            className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white">
                  {new Date(apt.appointment_date).toLocaleDateString()} at{" "}
                  {convertTo12Hour(apt.time_slot)}
                </p>
                <p className="text-sm text-zinc-400">{apt.customer_name}</p>
              </div>
              <button
                onClick={() => onDelete(apt.id)}
                className="text-red-400 hover:text-red-300 transition text-sm"
              >
                Delete
              </button>
            </div>
            <div className="text-xs text-zinc-500 space-y-1">
              <p>📞 {apt.phone}</p>
              <p>🎯 {apt.service_type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
