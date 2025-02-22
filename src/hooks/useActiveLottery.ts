
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useActiveLottery() {
  return useQuery({
    queryKey: ["active-lottery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lotteries')
        .select(`
          *,
          lottery_status (
            is_locked
          )
        `)
        .eq('is_completed', false)
        .gte('draw_date', new Date().toISOString().split('T')[0])
        .order('draw_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      return data;
    },
    staleTime: 30000, // Cache valid for 30 seconds
    retry: false, // Don't retry on failure since no data is an expected state
  });
}
