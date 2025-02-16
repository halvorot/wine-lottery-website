
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { DataTable } from "../table/DataTable";
import { DeletePrizeDialog } from "./DeletePrizeDialog";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  remaining_quantity: number;
  draw_date: string;
  created_at: string;
}

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

interface PrizesTableProps {
  prizes: Prize[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  page: number;
  totalCount: number;
  entriesPerPage: number;
  onPageChange: (newPage: number) => void;
}

export function PrizesTable({
  prizes,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalCount,
  entriesPerPage,
  onPageChange,
}: PrizesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  const handleDeleteClick = (prize: Prize) => {
    setSelectedPrize(prize);
    setDeleteDialogOpen(true);
  };

  const columns = [
    { 
      key: "name", 
      label: "Prize", 
      sortable: true 
    },
    { 
      key: "description", 
      label: "Description",
      render: (prize: Prize) => prize.description || "-"
    },
    { 
      key: "quantity", 
      label: "Quantity", 
      sortable: true 
    },
    { 
      key: "remaining_quantity", 
      label: "Remaining",
    },
    { 
      key: "draw_date", 
      label: "Draw Date", 
      sortable: true,
      render: (prize: Prize) => format(new Date(prize.draw_date), "PPP")
    },
    { 
      key: "created_at", 
      label: "Added", 
      sortable: true,
      render: (prize: Prize) => format(new Date(prize.created_at), "PPP")
    },
  ];

  return (
    <>
      <DataTable
        data={prizes}
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        page={page}
        totalCount={totalCount}
        entriesPerPage={entriesPerPage}
        onPageChange={onPageChange}
        renderActions={(prize) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(prize)}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />

      <DeletePrizeDialog
        prize={selectedPrize}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
