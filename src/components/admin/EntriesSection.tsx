import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SortColumn, SortDirection } from "@/components/lottery/types";
import { EntryDatePicker } from "./entries/EntryDatePicker";
import { EntriesTable } from "./entries/EntriesTable";
import { DeleteEntryDialog } from "./entries/DeleteEntryDialog";
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
  const [localEntries, setLocalEntries] = useState(entries);
  const entriesPerPage = 10;
  const totalEntries = localEntries.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  useEffect(() => {
    const channel = supabase
      .channel('lottery_entries_changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lottery_entries'
        },
        (payload) => {
          setLocalEntries(current => 
            current.filter(entry => entry.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteClick = (entry: Entry) => {
    setSelectedEntry(entry);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h3 className="text-xl font-semibold">Entries</h3>
        <EntryDatePicker
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      </div>

      <EntriesTable
        entries={localEntries}
        startIndex={startIndex}
        endIndex={endIndex}
        sortColumn={sortColumn}
        onSort={onSort}
        onDeleteClick={handleDeleteClick}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {totalEntries === 0 
            ? "No entries found"
            : `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`
          }
        </div>
        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || totalEntries === 0}
            className="flex-1 sm:flex-none"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || totalEntries === 0}
            className="flex-1 sm:flex-none"
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteEntryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedEntry={selectedEntry}
        onEntryDeleted={() => {
          setSelectedEntry(null);
          // The real-time subscription will handle updating the UI
        }}
      />
    </div>
  );
};
