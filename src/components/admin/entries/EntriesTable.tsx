import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { SortColumn } from "@/components/lottery/types";
import { formatDateNorwegian } from "@/lib/date-utils";
import { useState } from "react";

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
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer whitespace-nowrap">
                Name {renderSortIcon("name")}
              </TableHead>
              <TableHead className="hidden sm:table-cell cursor-pointer whitespace-nowrap">
                Email {renderSortIcon("email")}
              </TableHead>
              <TableHead className="cursor-pointer whitespace-nowrap">
                Tickets {renderSortIcon("num_tickets")}
              </TableHead>
              <TableHead className="cursor-pointer whitespace-nowrap">
                Entry Time {renderSortIcon("created_at")}
              </TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
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
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{entry.email || "-"}</TableCell>
                  <TableCell>{entry.num_tickets}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateNorwegian(entry.created_at, "PP p")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDeleteClick(entry)}
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
    </div>
  );
};
