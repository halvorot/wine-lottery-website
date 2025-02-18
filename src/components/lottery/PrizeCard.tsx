
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables']
type Prize = Tables['prizes']['Row']
type LotteryEntry = Tables['lottery_entries']['Row']
type LotteryWinner = Tables['lottery_winners']['Row']

interface PrizeCardProps {
  prize: Prize;
  index: number;
  winners: (LotteryWinner & { entry: LotteryEntry; prize: Prize })[] | undefined;
  baseChance: number;
}

export const PrizeCard = ({ prize, index, winners, baseChance }: PrizeCardProps) => {
  const prizeWinners = winners?.filter(w => w.prize_id === prize.id) || [];
  const isDrawn = prizeWinners.length > 0;

  return (
    <div
      className={cn(
        "bg-cream rounded-lg p-6 relative transition-colors",
        isDrawn && "bg-cream/50"
      )}
    >
      {prize.price !== null && (
        <Badge
          variant="secondary"
          className="absolute -top-2 -right-2"
        >
          {Number(prize.price).toFixed(0)} kr
        </Badge>
      )}
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
      {!isDrawn && baseChance > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          Chance per ticket: {baseChance.toFixed(2)}%
        </p>
      )}
      {prizeWinners.length > 0 && (
        <div className="mt-4 text-sm border-t border-gray-200 pt-2">
          <p className="font-semibold">Winner:</p>
          {prizeWinners.map(winner => (
            <p key={winner.id} className="text-primary">
              {winner.entry.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
