
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "./useActiveLottery";

export function useLotteryStatus() {
  const { data: activeLottery } = useActiveLottery();

  return useQuery({
    queryKey: ["lottery-status", activeLottery?.id],
    queryFn: async () => {
      if (!activeLottery) return null;

      const { data: existingStatus, error: fetchError } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!existingStatus) {
        const { data: newStatus, error: createError } = await supabase
          .from("lottery_status")
          .insert([{ 
            lottery_id: activeLottery.id,
            is_locked: false 
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        return newStatus;
      }
      
      return existingStatus;
    },
    enabled: !!activeLottery,
  });
}
