
import { Users, Timer, Trophy } from "lucide-react";

interface AdminStatsProps {
  entriesCount: number;
  prizesCount: number;
}

export const AdminStats = ({ entriesCount, prizesCount }: AdminStatsProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-cream rounded-lg p-6">
        <Users className="mb-2" />
        <h3 className="text-xl font-semibold">Total Entries</h3>
        <p className="text-2xl font-bold">{entriesCount}</p>
      </div>
      <div className="bg-cream rounded-lg p-6">
        <Timer className="mb-2" />
        <h3 className="text-xl font-semibold">Time Left</h3>
        <p className="text-2xl font-bold">03:45:22</p>
      </div>
      <div className="bg-cream rounded-lg p-6">
        <Trophy className="mb-2" />
        <h3 className="text-xl font-semibold">Total Prizes</h3>
        <p className="text-2xl font-bold">{prizesCount}</p>
      </div>
    </div>
  );
};
