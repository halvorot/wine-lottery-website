
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "./useActiveLottery";

export function useLotteryStatus() {
  const { data: activeLottery } = useActiveLottery();

  return useQuery({
    queryKey: ["lottery-status", activeLottery?.id],
    queryFn: async () => {
      if (!activeLottery) return null;

      // First check if lottery should be locked based on time
      const { data: shouldLock } = await supabase
        .rpc('should_lock_lottery', { target_lottery_id: activeLottery.id });

      if (shouldLock) {
        // If lottery should be locked, update the status
        const { data: updatedStatus, error: updateError } = await supabase
          .from("lottery_status")
          .update({ 
            is_locked: true,
            locked_at: new Date().toISOString()
          })
          .eq("lottery_id", activeLottery.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        return updatedStatus;
      }

      // If not expired, get current status
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
    // Refetch every minute to check lock status
    refetchInterval: 60000,
  });
}
