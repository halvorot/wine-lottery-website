
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useActiveLottery() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["active-lottery"],
    queryFn: async () => {
      try {
        // First check if supabase is initialized properly
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }

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
      } catch (error) {
        console.error("Error fetching active lottery:", error);
        toast({
          title: "Error",
          description: "Failed to load lottery data. Please refresh the page.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 30000, // Cache valid for 30 seconds
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}
