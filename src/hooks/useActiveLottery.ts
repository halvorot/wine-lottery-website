
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type LotteryWithStatus = {
  id: number;
  draw_date: string;
  is_completed: boolean;
  lottery_status: {
    is_locked: boolean;
  } | null;
} | null;

export function useActiveLottery() {
  return useQuery<LotteryWithStatus>({
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
        console.error("Error fetching active lottery:", error);
        toast({
          title: "Error",
          description: "Failed to fetch lottery information. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      return data;
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
    cacheTime: 60000,
  });
}
