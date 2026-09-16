import { listAllReservations } from "@/src/lib/bookings";

export const metadata = {
  title: "Bookings",
};

export default async function AdminBookingsPage() {
  const stays = await listAllReservations();

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Calendar</p>
      <h1 className="font-heading mt-1 text-4xl">Stays & holds</h1>
      {stays.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No reservation windows yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Home</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stays.map((stay) => (
                <tr key={stay.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{stay.propertyTitle}</td>
                  <td className="px-4 py-3">
                    {stay.startDate} → {stay.endDate}
                  </td>
                  <td className="px-4 py-3">
                    {stay.guestName || "—"}
                    {stay.guestEmail ? ` · ${stay.guestEmail}` : ""}
                  </td>
                  <td className="px-4 py-3 uppercase tracking-[0.12em]">{stay.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
