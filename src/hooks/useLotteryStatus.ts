
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

      const drawDateTime = new Date(`${activeLottery.draw_date}T${activeLottery.draw_time}`);
      const hasReachedDrawTime = drawDateTime <= new Date();
      
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

      // If lottery has reached draw time and hasn't been manually unlocked after draw time
      // (locked_at will be before draw time for initial lock, after for manual locks)
      if (hasReachedDrawTime && !existingStatus.is_locked && 
          (!existingStatus.locked_at || new Date(existingStatus.locked_at) < drawDateTime)) {
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
      
      return existingStatus;
    },
    enabled: !!activeLottery,
    // Refetch every minute to check lock status
    refetchInterval: 60000,
  });
}
