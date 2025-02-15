
import { Trophy } from "lucide-react";
import { LiveTicker } from "./LiveTicker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const LiveDrawTab = () => {
  const { data: todayPrizes } = useQuery({
    queryKey: ["today-prizes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .eq("draw_date", new Date().toISOString().split("T")[0])
        .order("quantity", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-8">
      <LiveTicker />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center space-y-8">
        <Trophy size={48} className="text-gold mx-auto" strokeWidth={1.5} />
        <h2 className="text-3xl font-bold">Today's Prize Pool</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {todayPrizes && todayPrizes.length > 0 ? (
            todayPrizes.map((prize, index) => (
              <div key={prize.id} className="bg-cream rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {index === 0
                    ? "Grand Prize"
                    : index === 1
                    ? "Second Prize"
                    : "Third Prize"}
                </h3>
                <p>{prize.name}</p>
                {prize.description && (
                  <p className="text-sm text-muted-foreground mt-2">{prize.description}</p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-muted-foreground">
              No prizes available for today's draw yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
