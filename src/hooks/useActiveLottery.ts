import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useActiveLottery() {
  const { toast } = useToast();
  console.log("useActiveLottery called");

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
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    initialData: undefined
  });
}
