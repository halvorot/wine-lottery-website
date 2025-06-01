import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Table, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../table/DataTable";
import { useToggleLottery } from "@/hooks/useToggleLottery";
import { formatDateNorwegian } from "@/lib/date-utils";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  created_at: string;
}

interface Entry {
  id: string;
  name: string;
  email: string;
  num_tickets: number;
  created_at: string;
}

interface Lottery {
  id: string;
  lottery_status?: {
    is_locked: boolean;
  };
}

export function LotteryDetails({ lottery }: { lottery: Lottery }) {
  const [prizesPage, setPrizesPage] = useState(1);
  const [entriesPage, setEntriesPage] = useState(1);
  const [prizeSort, setPrizeSort] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "name",
    direction: "asc",
  });
  const [entrySort, setEntrySort] = useState<{ column: string; direction: "asc" | "desc" }>({
    column: "created_at",
    direction: "desc",
  });
  const entriesPerPage = 5;
  const toggleLockMutation = useToggleLottery();

  const { data: prizes } = useQuery({
    queryKey: ["prizes", lottery.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .eq("lottery_id", lottery.id);

      if (error) throw error;
      return data as Prize[];
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["entries", lottery.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select("*")
        .eq("lottery_id", lottery.id);

      if (error) throw error;
      return data as Entry[];
    },
  });

  const handlePrizeSort = (column: string) => {
    setPrizeSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPrizesPage(1);
  };

  const handleEntrySort = (column: string) => {
    setEntrySort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
    setEntriesPage(1);
  };

  const sortedPrizes = prizes?.sort((a, b) => {
    const aValue = a[prizeSort.column as keyof Prize];
    const bValue = b[prizeSort.column as keyof Prize];
    return prizeSort.direction === "asc"
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const sortedEntries = entries?.sort((a, b) => {
    const aValue = a[entrySort.column as keyof Entry];
    const bValue = b[entrySort.column as keyof Entry];
    return entrySort.direction === "asc"
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const paginatedPrizes = sortedPrizes?.slice(
    (prizesPage - 1) * entriesPerPage,
    prizesPage * entriesPerPage
  );

  const paginatedEntries = sortedEntries?.slice(
    (entriesPage - 1) * entriesPerPage,
    entriesPage * entriesPerPage
  );

  const prizeColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
    { 
      key: "price", 
      label: "Price", 
      sortable: true,
      render: (prize: Prize) => prize.price ? `${prize.price} kr` : "-"
    },
    {
      key: "created_at",
      label: "Added",
      sortable: true,
      render: (prize: Prize) => formatDateNorwegian(prize.created_at, "PPP")
    }
  ];

  const entryColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "num_tickets", label: "Tickets", sortable: true },
    {
      key: "created_at",
      label: "Entry Time",
      sortable: true,
      render: (entry: Entry) => formatDateNorwegian(entry.created_at, "PPP p")
    },
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => toggleLockMutation.mutate(lottery.id)}
            disabled={toggleLockMutation.isPending}
            variant="outline"
            className={lottery.lottery_status?.is_locked ? "text-green-600" : "text-red-600"}
          >
            {lottery.lottery_status?.is_locked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" /> Unlock Lottery
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" /> Lock Lottery
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Status: {lottery.lottery_status?.is_locked ? "Locked" : "Open"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          <h4 className="font-semibold">Prizes</h4>
        </div>
        <DataTable
          data={paginatedPrizes || []}
          columns={prizeColumns}
          sortColumn={prizeSort.column}
          sortDirection={prizeSort.direction}
          onSort={handlePrizeSort}
          page={prizesPage}
          totalCount={prizes?.length || 0}
          entriesPerPage={entriesPerPage}
          onPageChange={setPrizesPage}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          <h4 className="font-semibold">Entries</h4>
        </div>
        <DataTable
          data={paginatedEntries || []}
          columns={entryColumns}
          sortColumn={entrySort.column}
          sortDirection={entrySort.direction}
          onSort={handleEntrySort}
          page={entriesPage}
          totalCount={entries?.length || 0}
          entriesPerPage={entriesPerPage}
          onPageChange={setEntriesPage}
        />
      </div>
    </div>
  );
}
