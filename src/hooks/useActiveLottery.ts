
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useActiveLottery() {
  return useQuery({
    queryKey: ["active-lottery"],
    queryFn: async () => {
      try {
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
      } catch (err) {
        console.error("Unexpected error in useActiveLottery:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    },
    retry: 1, // Only retry once to prevent infinite loading
    retryDelay: 1000, // Wait 1 second before retrying
  });
}
