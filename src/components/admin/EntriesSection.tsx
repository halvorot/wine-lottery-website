
interface Entry {
  id: string;
  name: string;
  email: string | null;
  num_tickets: number;
  created_at: string;
}

interface EntriesSectionProps {
  entries: Entry[];
}

export const EntriesSection = ({ entries }: EntriesSectionProps) => {
  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">Today's Entries</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Tickets</th>
            <th className="text-left p-4">Entry Time</th>
          </tr>
        </thead>
        <tbody>
          {entries?.map((entry) => (
            <tr key={entry.id} className="border-b">
              <td className="p-4">{entry.name}</td>
              <td className="p-4">{entry.email || "-"}</td>
              <td className="p-4">{entry.num_tickets}</td>
              <td className="p-4">
                {new Date(entry.created_at).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
