
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLotteryStatus() {
  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", new Date().toISOString().split("T")[0])
        .single();

      if (error) throw error;
      return data;
    },
  });

  return lotteryStatus;
}
