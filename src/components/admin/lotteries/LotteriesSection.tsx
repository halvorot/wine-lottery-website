import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { useState } from "react";
import { CreateLotteryDialog } from "./CreateLotteryDialog";
import { DeleteLotteryDialog } from "./DeleteLotteryDialog";
import { LotteryItem } from "./LotteryItem";
import { useActiveLottery } from "@/hooks/useActiveLottery";

interface Lottery {
  id: string;
  draw_date: string;
  draw_time: string;
  created_at: string;
  is_completed: boolean;
  lottery_status: {
    is_locked: boolean;
  };
}

export function LotteriesSection() {
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);
  const { data: activeLottery } = useActiveLottery();

  const { data: lotteries, isLoading } = useQuery({
    queryKey: ["lotteries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotteries")
        .select(`
          *,
          lottery_status (
            is_locked
          )
        `)
        .order("draw_date", { ascending: false });

      if (error) throw error;
      return data as Lottery[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h3 className="text-xl font-semibold">Lotteries</h3>
        <CreateLotteryDialog />
      </div>

      {(!lotteries || lotteries.length === 0) ? (
        <div className="text-center p-4 sm:p-8 bg-cream/50 rounded-lg">
          <p className="text-lg text-wine font-semibold mb-2">No Lotteries Found</p>
          <p className="text-charcoal/80 mb-4">
            Get started by creating your first lottery event using the button above.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {lotteries.map((lottery) => (
            <LotteryItem
              key={lottery.id}
              lottery={lottery}
              onDelete={setDeletingLotteryId}
              isActive={activeLottery?.id === lottery.id}
            />
          ))}
        </Accordion>
      )}

      <DeleteLotteryDialog
        lotteryId={deletingLotteryId}
        onOpenChange={(open) => !open && setDeletingLotteryId(null)}
      />
    </div>
  );
}
