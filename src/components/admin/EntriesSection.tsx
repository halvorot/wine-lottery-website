import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SortColumn, SortDirection } from "@/components/lottery/types";
import { EntryDatePicker } from "./entries/EntryDatePicker";
import { EntriesTable } from "./entries/EntriesTable";
import { DeleteEntryDialog } from "./entries/DeleteEntryDialog";

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
  const entriesPerPage = 10;
  const totalEntries = entries.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);

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
        entries={entries}
        startIndex={startIndex}
        endIndex={endIndex}
        sortColumn={sortColumn}
        onSort={onSort}
        onDeleteClick={handleDeleteClick}
      />

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

      <DeleteEntryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedEntry={selectedEntry}
        onEntryDeleted={() => {
          setSelectedEntry(null);
          // The parent component will handle the refresh through React Query
        }}
      />
    </div>
  );
};
