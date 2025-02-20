
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "./useActiveLottery";

export function useLotteryStatus() {
  const { data: activeLottery } = useActiveLottery();

  return useQuery({
    queryKey: ["lottery-status", activeLottery?.id],
    queryFn: async () => {
      if (!activeLottery) return null;

      // Get current status
      const { data: existingStatus, error: fetchError } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!existingStatus) {
        // Create a new locked status if none exists
        const { data: newStatus, error: createError } = await supabase
          .from("lottery_status")
          .insert([{ 
            lottery_id: activeLottery.id,
            is_locked: true,
            locked_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        return newStatus;
      }
      
      return existingStatus;
    },
    enabled: !!activeLottery,
    // Refetch every minute to check lock status
    refetchInterval: 60000,
  });
}
