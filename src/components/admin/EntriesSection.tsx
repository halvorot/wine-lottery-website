
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SortColumn, SortDirection } from "@/components/lottery/types";

interface Entry {
  id: string;
  name: string;
  email: string | null;
  num_tickets: number;
  created_at: string;
}

interface EntriesSectionProps {
  entries: Entry[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  page: number;
  onPageChange: (page: number) => void;
  onSort: (column: SortColumn) => void;
  selectedDate: string | "all";
  onDateChange: (date: string | "all") => void;
}

export const EntriesSection = ({ 
  entries,
  sortColumn,
  sortDirection,
  page,
  onPageChange,
  onSort,
  selectedDate,
  onDateChange,
}: EntriesSectionProps) => {
  const entriesPerPage = 10;
  const totalEntries = entries.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    // Subtract the timezone offset to ensure we get the correct date
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onDateChange(adjustedDate.toISOString().split("T")[0]);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
    onDateChange(adjustedDate.toISOString().split("T")[0]);
  };

  const handleShowAllDates = () => {
    onDateChange("all");
  };

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
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Entries</h3>
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
                {selectedDate === "all" ? "All Dates" : format(new Date(selectedDate), "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate === "all" ? undefined : new Date(selectedDate)}
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
          <Button 
            variant="outline"
            onClick={handleShowAllDates}
          >
            All Dates
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
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || totalEntries === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || totalEntries === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
