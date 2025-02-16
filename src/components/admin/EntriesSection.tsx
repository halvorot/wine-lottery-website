
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SortColumn, SortDirection } from "@/components/lottery/types";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const { toast } = useToast();
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

  const handleDeleteClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEntry) return;

    // First check if the entry is a winner
    const { data: winnerEntry, error: winnerCheckError } = await supabase
      .from('lottery_winners')
      .select('*')
      .eq('entry_id', selectedEntry.id)
      .maybeSingle();

    if (winnerCheckError) {
      toast({
        title: "Error",
        description: "Failed to check entry status. Please try again.",
        variant: "destructive",
      });
      console.error("Winner check error:", winnerCheckError);
      return;
    }

    if (winnerEntry) {
      toast({
        title: "Cannot Delete Entry",
        description: "This entry cannot be deleted because it has won a prize.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setSelectedEntry(null);
      return;
    }

    // If not a winner, proceed with deletion
    const { error } = await supabase
      .from("lottery_entries")
      .delete()
      .eq("id", selectedEntry.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete the entry. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    } else {
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    }
    setDeleteDialogOpen(false);
    setSelectedEntry(null);
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="text-xl font-semibold">Entries</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal flex-1 sm:flex-none",
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
            className="flex-1 sm:flex-none"
          >
            Today
          </Button>
          <Button 
            variant="outline"
            onClick={handleShowAllDates}
            className="flex-1 sm:flex-none"
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
                      onClick={() => handleDeleteClick(entry)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedEntry?.name}'s entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
