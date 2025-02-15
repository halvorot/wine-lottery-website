
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Users } from "lucide-react";
import { AddPrizeForm } from "@/components/AddPrizeForm";

export const AdminDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <Button className="bg-wine hover:bg-wine-light text-white">
          Draw Winner
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-cream rounded-lg p-6">
          <Users className="mb-2" />
          <h3 className="text-xl font-semibold">Total Entries</h3>
          <p className="text-2xl font-bold">247</p>
        </div>
        <div className="bg-cream rounded-lg p-6">
          <Timer className="mb-2" />
          <h3 className="text-xl font-semibold">Time Left</h3>
          <p className="text-2xl font-bold">03:45:22</p>
        </div>
        <div className="bg-cream rounded-lg p-6">
          <Trophy className="mb-2" />
          <h3 className="text-xl font-semibold">Total Prizes</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-cream/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Prize</h3>
          <AddPrizeForm />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Tickets</th>
                <th className="text-left p-4">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">John Doe #{i + 1}</td>
                    <td className="p-4">{Math.floor(Math.random() * 5) + 1}</td>
                    <td className="p-4">2 minutes ago</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
