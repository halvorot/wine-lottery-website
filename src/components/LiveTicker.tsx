
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LotteryEntry } from "./lottery/types";

export const LiveTicker = () => {
  const { data: entries } = useQuery({
    queryKey: ["recent-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select("*")
        .eq("entry_date", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as LotteryEntry[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds to keep the ticker up to date
  });

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden whitespace-nowrap w-full bg-cream/50 backdrop-blur-sm rounded-lg p-4">
      <div className="animate-ticker inline-block">
        {entries.map((entry, i) => (
          <span key={entry.id} className="inline-block mx-8">
            {entry.name} entered with {entry.num_tickets} ticket{entry.num_tickets !== 1 ? 's' : ''}
          </span>
        ))}
        {/* Duplicate entries to create seamless loop */}
        {entries.map((entry, i) => (
          <span key={`${entry.id}-duplicate`} className="inline-block mx-8">
            {entry.name} entered with {entry.num_tickets} ticket{entry.num_tickets !== 1 ? 's' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};
