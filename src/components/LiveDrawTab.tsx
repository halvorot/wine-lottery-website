
import { Trophy } from "lucide-react";
import { LiveTicker } from "./LiveTicker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables']
type Prize = Tables['prizes']['Row']
type LotteryEntry = Tables['lottery_entries']['Row']
type LotteryWinner = Tables['lottery_winners']['Row']

export const LiveDrawTab = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuthStatus();
  
  const { data: todayPrizes } = useQuery<Prize[]>({
    queryKey: ["today-prizes"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq("draw_date", today)
        .order("quantity", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleDrawWinner = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    // Get all entries for today
    const { data: entries, error: entriesError } = await supabase
        .from('lottery_entries')
        .select('*')
        .eq("entry_date", today)
        .eq("drawn", false);

    if (entriesError || !entries || entries.length === 0) {
      toast({
        title: "No entries",
        description: "There are no entries for today's draw",
        variant: "destructive",
      });
      return;
    }

    // Get available prizes for today
    const { data: availablePrizes, error: prizesError } = await supabase
        .from('prizes')
        .select('*')
        .eq("draw_date", today)
        .gt("remaining_quantity", 0);

    if (prizesError || !availablePrizes || availablePrizes.length === 0) {
      toast({
        title: "Error",
        description: "No available prizes for today",
        variant: "destructive",
      });
      return;
    }

    // Randomly select a winner
    const randomEntry = entries[Math.floor(Math.random() * entries.length)];
    const randomPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

    // Insert winner record
    const { error: winnerError } = await supabase
      .from('lottery_winners')
      .insert({
        entry_id: randomEntry.id,
        prize_id: randomPrize.id,
        draw_date: today
      });

    if (winnerError) {
      toast({
        title: "Error",
        description: "Failed to record winner",
        variant: "destructive",
      });
      return;
    }

    // Update prize remaining quantity
    const { error: updateError } = await supabase
      .from('prizes')
      .update({ remaining_quantity: randomPrize.remaining_quantity - 1 })
      .eq("id", randomPrize.id);

    // Mark entry as drawn
    const { error: updateEntryError } = await supabase
      .from('lottery_entries')
      .update({ drawn: true })
      .eq("id", randomEntry.id);

    if (updateError || updateEntryError) {
      toast({
        title: "Error",
        description: "Failed to update records",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: `Winner drawn successfully! ${randomEntry.name} has won ${randomPrize.name}!`
    });
  };

  return (
    <div className="space-y-8">
      <LiveTicker />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center space-y-8">
        <Trophy size={48} className="text-gold mx-auto" strokeWidth={1.5} />
        <h2 className="text-3xl font-bold">Today's Prize Pool</h2>
        {isAdmin && (
          <div className="flex justify-center">
            <Button onClick={handleDrawWinner} className="bg-gold hover:bg-gold/90 text-white">
              Draw Winner
            </Button>
          </div>
        )}
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
};
