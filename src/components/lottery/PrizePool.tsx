
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrizeCard } from "./PrizeCard";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables']
type Prize = Tables['prizes']['Row']
type LotteryEntry = Tables['lottery_entries']['Row']
type LotteryWinner = Tables['lottery_winners']['Row']

interface PrizePoolProps {
  prizes: Prize[] | undefined;
  winners: (LotteryWinner & { entry: LotteryEntry; prize: Prize })[] | undefined;
  isAdmin: boolean;
  onDrawWinner: () => void;
  calculateWinningChance: (numTickets: number) => number;
}

export const PrizePool = ({ 
  prizes, 
  winners, 
  isAdmin, 
  onDrawWinner,
  calculateWinningChance 
}: PrizePoolProps) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center space-y-8">
      <Trophy size={48} className="text-gold mx-auto" strokeWidth={1.5} />
      <h2 className="text-3xl font-bold">Today's Prize Pool</h2>
      {isAdmin && (
        <div className="flex justify-center">
          <Button onClick={onDrawWinner} className="bg-gold hover:bg-gold/90 text-white">
            Draw Winner
          </Button>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        {prizes && prizes.length > 0 ? (
          prizes.map((prize, index) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
              index={index}
              winners={winners}
              baseChance={calculateWinningChance(1)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center text-muted-foreground">
            No prizes available for today's draw yet.
          </div>
        )}
      </div>
    </div>
  );
};
