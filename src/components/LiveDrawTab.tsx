import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { WinnerAnnouncement } from "./WinnerAnnouncement";
import { LiveTicker } from "./LiveTicker";
import { useState } from "react";
import { LotteryStats } from "./lottery/LotteryStats";
import { PrizePool } from "./lottery/PrizePool";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables']
type Prize = Tables['prizes']['Row']
type LotteryEntry = Tables['lottery_entries']['Row']
type LotteryWinner = Tables['lottery_winners']['Row']

interface LotteryStats {
  total_entries: number;
  total_tickets: number;
  total_prizes: number;
  remaining_prizes: number;
}

export const LiveDrawTab = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuthStatus();
  const [lastWinner, setLastWinner] = useState<{ name: string; prizeName: string } | null>(null);
  
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

  const { data: winners } = useQuery<(LotteryWinner & { entry: LotteryEntry; prize: Prize })[]>({
    queryKey: ["today-winners"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from('lottery_winners')
        .select('*, entry:lottery_entries(*), prize:prizes(*)')
        .eq("draw_date", today);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: lotteryStats } = useQuery<LotteryStats>({
    queryKey: ["lottery-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .rpc('get_lottery_stats', { target_date: today });

      if (error) throw error;
      return (data && data[0]) || { 
        total_entries: 0, 
        total_tickets: 0, 
        total_prizes: 0, 
        remaining_prizes: 0 
      };
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

    // Set the last winner for the animation
    setLastWinner({
      name: randomEntry.name,
      prizeName: randomPrize.name
    });

    toast({
      title: "Success!",
      description: `Winner drawn successfully! ${randomEntry.name} has won ${randomPrize.name}!`
    });
  };

  const calculateWinningChance = (numTickets: number) => {
    if (!lotteryStats || lotteryStats.total_tickets === 0) return 0;
    return (numTickets / lotteryStats.total_tickets) * 100;
  };

  return (
    <div className="space-y-8">
      <WinnerAnnouncement winner={lastWinner} />
      <LiveTicker />
      <LotteryStats stats={lotteryStats} />
      <PrizePool
        prizes={todayPrizes}
        winners={winners}
        isAdmin={isAdmin}
        onDrawWinner={handleDrawWinner}
        calculateWinningChance={calculateWinningChance}
      />
    </div>
  );
};
