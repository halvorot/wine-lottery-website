
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useActiveLottery() {
  return useQuery({
    queryKey: ["active-lottery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .eq('is_active', true)
        .eq('is_completed', false)
        .order('draw_date', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No active lottery found
          return null;
        }
        throw error;
      }
      
      return data;
    },
  });
}
