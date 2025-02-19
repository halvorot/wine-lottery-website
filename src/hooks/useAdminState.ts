
import { useState } from "react";

type SortColumn = "name" | "price" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export function useAdminState() {
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | "all">(
    new Date().toISOString().split("T")[0]
  );

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
    sortColumn,
    sortDirection,
    page,
    selectedDate,
    setPage,
    setSelectedDate,
    handleSort,
  };
}
