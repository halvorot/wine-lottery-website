
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useActiveLottery() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["active-lottery"],
    queryFn: async () => {
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
        console.error("Error fetching active lottery:", error);
        toast({
          title: "Error",
          description: "Failed to load lottery data. Please refresh the page.",
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    staleTime: 30000, // Cache valid for 30 seconds
    retry: 2, // Reduce retries to avoid long loading states
    retryDelay: 1000, // Fixed 1s delay between retries
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Properly type the initialData to avoid stale states
    initialData: undefined
  });
}
