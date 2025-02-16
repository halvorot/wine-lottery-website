
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export function useAdminPrizes(
  sortColumn: SortColumn,
  sortDirection: SortDirection,
  page: number,
  entriesPerPage: number,
  selectedDate: string | "all"
) {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('prizes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'prizes'
        },
        () => {
          // Invalidate and refetch queries when changes occur
          queryClient.invalidateQueries({ 
            queryKey: ["prizes", sortColumn, sortDirection, page, selectedDate]
          });
          queryClient.invalidateQueries({ 
            queryKey: ["prizes-count", selectedDate]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, sortColumn, sortDirection, page, selectedDate]);

  const { data: prizes, isLoading: isPrizesLoading } = useQuery({
    queryKey: ["prizes", sortColumn, sortDirection, page, selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("prizes")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range((page - 1) * entriesPerPage, page * entriesPerPage - 1);

      if (selectedDate !== "all") {
        query = query.eq("draw_date", selectedDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: totalPrizes } = useQuery({
    queryKey: ["prizes-count", selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("prizes")
        .select("*", { count: "exact", head: true });

      if (selectedDate !== "all") {
        query = query.eq("draw_date", selectedDate);
      }

      const { count, error } = await query;
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
