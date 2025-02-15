
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

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
  const totalPages = Math.ceil(totalCount / entriesPerPage);

  const renderSortIcon = (column: SortColumn) => {
    return (
      <Button
        variant="ghost"
        onClick={() => onSort(column)}
        className="h-8 px-2"
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Prize List</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer">
                Prize {renderSortIcon("name")}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="cursor-pointer">
                Quantity {renderSortIcon("quantity")}
              </TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead className="cursor-pointer">
                Draw Date {renderSortIcon("draw_date")}
              </TableHead>
              <TableHead className="cursor-pointer">
                Added {renderSortIcon("created_at")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prizes.map((prize) => (
              <TableRow key={prize.id}>
                <TableCell>{prize.name}</TableCell>
                <TableCell>{prize.description || "-"}</TableCell>
                <TableCell>{prize.quantity}</TableCell>
                <TableCell>{prize.remaining_quantity}</TableCell>
                <TableCell>{format(new Date(prize.draw_date), "PPP")}</TableCell>
                <TableCell>{format(new Date(prize.created_at), "PPP")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * entriesPerPage) + 1} to {Math.min(page * entriesPerPage, totalCount)} of {totalCount} prizes
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
