import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { useState } from "react";
import { CreateLotteryDialog } from "./CreateLotteryDialog";
import { DeleteLotteryDialog } from "./DeleteLotteryDialog";
import { LotteryItem } from "./LotteryItem";

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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Lotteries</h3>
        <CreateLotteryDialog />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {lotteries?.map((lottery) => (
          <LotteryItem
            key={lottery.id}
            lottery={lottery}
            onDelete={setDeletingLotteryId}
          />
        ))}
      </Accordion>

      {(!lotteries || lotteries.length === 0) && (
        <p className="text-center text-muted-foreground py-8">
          No lotteries found. Create one to get started.
        </p>
      )}

      <DeleteLotteryDialog
        lotteryId={deletingLotteryId}
        onOpenChange={(open) => !open && setDeletingLotteryId(null)}
      />
    </div>
  );
}
