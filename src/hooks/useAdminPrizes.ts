
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export function useAdminPrizes(
  sortColumn: SortColumn,
  sortDirection: SortDirection,
  page: number,
  entriesPerPage: number
) {
  const { data: prizes, isLoading: isPrizesLoading } = useQuery({
    queryKey: ["prizes", sortColumn, sortDirection, page],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
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
      const today = new Date().toISOString().split('T')[0];
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
