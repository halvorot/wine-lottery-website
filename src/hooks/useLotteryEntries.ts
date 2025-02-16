
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LotteryEntry, SortColumn, SortDirection } from "@/components/lottery/types";

export function useLotteryEntries(entriesPerPage: number = 10) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | "all">(
    new Date().toISOString().split("T")[0]
  );

  const { data: todayEntries } = useQuery({
    queryKey: ["entries", sortColumn, sortDirection, page, selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("lottery_entries")
        .select("*", { count: "exact" });

      if (selectedDate !== "all") {
        query = query.eq("entry_date", selectedDate);
      }

      const { data, error } = await query
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range((page - 1) * entriesPerPage, page * entriesPerPage - 1);

      if (error) throw error;
      return data as LotteryEntry[];
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ["entries-count", selectedDate],
    queryFn: async () => {
      let query = supabase
        .from("lottery_entries")
        .select("*", { count: "exact", head: true });

      if (selectedDate !== "all") {
        query = query.eq("entry_date", selectedDate);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  return {
    todayEntries,
    totalCount: totalCount || 0,
    sortColumn,
    sortDirection,
    page,
    setPage,
    handleSort,
    selectedDate,
    setSelectedDate,
  };
}
