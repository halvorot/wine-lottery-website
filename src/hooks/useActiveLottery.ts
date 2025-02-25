
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome');
};

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
    staleTime: isSafari() ? 0 : 30000, // Disable cache in Safari
    cacheTime: isSafari() ? 1000 : 5 * 60 * 1000, // Short cache time in Safari
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Force refetch on mount in Safari
    refetchOnMount: isSafari() ? 'always' : true,
    gcTime: isSafari() ? 1000 : 5 * 60 * 1000, // Shorter garbage collection time in Safari
    initialData: undefined
  });
}
