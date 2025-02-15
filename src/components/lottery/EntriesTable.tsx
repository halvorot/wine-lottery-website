
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { LotteryEntry, SortColumn, SortDirection } from "./types";

interface EntriesTableProps {
  entries: LotteryEntry[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  page: number;
  totalCount: number;
  entriesPerPage: number;
  onPageChange: (newPage: number) => void;
}

export function EntriesTable({
  entries,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalCount,
  entriesPerPage,
  onPageChange,
}: EntriesTableProps) {
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
      <h3 className="text-lg font-semibold mb-4">Today's Entries</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer">
                Name {renderSortIcon("name")}
              </TableHead>
              <TableHead className="cursor-pointer">
                Email {renderSortIcon("email")}
              </TableHead>
              <TableHead className="cursor-pointer">
                Tickets {renderSortIcon("num_tickets")}
              </TableHead>
              <TableHead className="cursor-pointer">
                Time {renderSortIcon("created_at")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.email}</TableCell>
                <TableCell>{entry.num_tickets}</TableCell>
                <TableCell>
                  {new Date(entry.created_at).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * entriesPerPage) + 1} to {Math.min(page * entriesPerPage, totalCount)} of {totalCount} entries
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
