
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  name: string;
  email: string | null;
  num_tickets: number;
  created_at: string;
}

type SortColumn = "name" | "email" | "num_tickets" | "created_at";
type SortDirection = "asc" | "desc";

interface EntriesSectionProps {
  entries: Entry[];
}

export const EntriesSection = ({ entries: initialEntries }: EntriesSectionProps) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [date, setDate] = useState<Date>(new Date());
  const entriesPerPage = 10;

  // Sort entries
  const sortedEntries = [...initialEntries].sort((a, b) => {
    if (sortColumn === "num_tickets") {
      return sortDirection === "asc" 
        ? a.num_tickets - b.num_tickets
        : b.num_tickets - a.num_tickets;
    }
    
    const aValue = a[sortColumn] || "";
    const bValue = b[sortColumn] || "";
    
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Calculate pagination
  const totalEntries = sortedEntries.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedEntries = sortedEntries.slice(startIndex, endIndex);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate || (date && format(newDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))) {
      return;
    }
    setDate(newDate);
    setPage(1);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setDate(today);
    setPage(1);
  };

  const renderSortIcon = (column: SortColumn) => {
    return (
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="h-8 px-2"
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Today's Entries</h3>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
          <Button 
            variant="outline"
            onClick={handleTodayClick}
          >
            Today
          </Button>
        </div>
      </div>

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.email || "-"}</TableCell>
                  <TableCell>{entry.num_tickets}</TableCell>
                  <TableCell>
                    {format(new Date(entry.created_at), "PPP p")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {totalEntries === 0 
            ? "No entries found"
            : `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`
          }
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || totalEntries === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || totalEntries === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
