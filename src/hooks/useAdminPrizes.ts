
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export function useAdminPrizes(
  sortColumn: SortColumn,
  sortDirection: SortDirection,
  page: number,
  entriesPerPage: number
) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('prizes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'prizes',
          filter: `draw_date=eq.${today}`
        },
        () => {
          // Invalidate and refetch queries when changes occur
          queryClient.invalidateQueries({ 
            queryKey: ["prizes", sortColumn, sortDirection, page]
          });
          queryClient.invalidateQueries({ 
            queryKey: ["prizes-count"]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, sortColumn, sortDirection, page, today]);

  const { data: prizes, isLoading: isPrizesLoading } = useQuery({
    queryKey: ["prizes", sortColumn, sortDirection, page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*", { count: "exact" })
        .eq("draw_date", today)
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range((page - 1) * entriesPerPage, page * entriesPerPage - 1);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: totalPrizes } = useQuery({
    queryKey: ["prizes-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("prizes")
        .select("*", { count: "exact", head: true })
        .eq("draw_date", today);

      if (error) throw error;
      return count || 0;
    },
  });

  return {
    prizes,
    isPrizesLoading,
    totalPrizes
  };
}
