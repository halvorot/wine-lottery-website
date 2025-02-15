
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLotteryStatus() {
  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: existingStatus, error: fetchError } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", today)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!existingStatus) {
        const { data: newStatus, error: createError } = await supabase
          .from("lottery_status")
          .insert([{ date: today, is_locked: false }])
          .select()
          .single();
          
        if (createError) throw createError;
        return newStatus;
      }
      
      return existingStatus;
    },
  });

  return lotteryStatus;
}
