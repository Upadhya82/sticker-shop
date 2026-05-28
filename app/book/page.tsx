import AppointmentForm from "@/components/AppointmentForm";

export default function BookPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Book an Appointment</h1>
      <p className="mt-2 text-sm text-gray-600">
        Fill the form to book your sticker service slot.
      </p>

      <div className="mt-6">
        <AppointmentForm />
      </div>
    </main>
  );
}