
import type { Database } from "@/integrations/supabase/types";

interface LotteryStatsProps {
  stats: {
    total_entries: number;
    total_tickets: number;
    total_prizes: number;
    remaining_prizes: number;
  } | undefined;
}

export const LotteryStats = ({ stats }: LotteryStatsProps) => {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Entries</h3>
        <p className="text-2xl font-bold">{stats?.total_entries || 0}</p>
      </div>
      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Tickets</h3>
        <p className="text-2xl font-bold">{stats?.total_tickets || 0}</p>
      </div>
      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Prizes</h3>
        <p className="text-2xl font-bold">{stats?.total_prizes || 0}</p>
      </div>
      <div className="bg-white rounded-lg p-4 text-center shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Remaining Prizes</h3>
        <p className="text-2xl font-bold">{stats?.remaining_prizes || 0}</p>
      </div>
    </div>
  );
};
