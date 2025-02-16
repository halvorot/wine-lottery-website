
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { SortColumn } from "@/components/lottery/types";

interface Entry {
  id: string;
  name: string;
  email: string | null;
  num_tickets: number;
  created_at: string;
}

interface EntriesTableProps {
  entries: Entry[];
  startIndex: number;
  endIndex: number;
  sortColumn: SortColumn;
  onSort: (column: SortColumn) => void;
  onDeleteClick: (entry: Entry) => void;
}

export const EntriesTable = ({
  entries,
  startIndex,
  endIndex,
  sortColumn,
  onSort,
  onDeleteClick,
}: EntriesTableProps) => {
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
              Entry Time {renderSortIcon("created_at")}
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No entries found
              </TableCell>
            </TableRow>
          ) : (
            entries.slice(startIndex, endIndex).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.email || "-"}</TableCell>
                <TableCell>{entry.num_tickets}</TableCell>
                <TableCell>
                  {format(new Date(entry.created_at), "PPP p")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(entry)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
