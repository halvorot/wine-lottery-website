
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EntryForm } from "./lottery/EntryForm";
import { EntriesTable } from "./lottery/EntriesTable";
import { LotteryEntry, SortColumn, SortDirection } from "./lottery/types";

export function LotteryEntryForm() {
  const [existingEntry, setExistingEntry] = useState<LotteryEntry | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const entriesPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query lottery status
  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", new Date().toISOString().split("T")[0])
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Query today's entries
  const { data: todayEntries } = useQuery({
    queryKey: ["today-entries", sortColumn, sortDirection, page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select("*", { count: "exact" })
        .eq("entry_date", new Date().toISOString().split("T")[0])
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range((page - 1) * entriesPerPage, page * entriesPerPage - 1);

      if (error) throw error;
      return data as LotteryEntry[];
    },
  });

  // Query total count
  const { data: totalCount } = useQuery({
    queryKey: ["entries-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("lottery_entries")
        .select("*", { count: "exact", head: true })
        .eq("entry_date", new Date().toISOString().split("T")[0]);

      if (error) throw error;
      return count || 0;
    },
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  // Check existing entry
  const checkExistingEntry = async (email: string) => {
    if (!email) return null;
    
    const { data, error } = await supabase
      .from("lottery_entries")
      .select("*")
      .eq("entry_date", new Date().toISOString().split("T")[0])
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing entry:", error);
      return null;
    }

    return data;
  };

  // Handle email change
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    
    if (newEmail) {
      const entry = await checkExistingEntry(newEmail);
      if (entry) {
        setExistingEntry(entry);
        toast({
          title: "Existing Entry Found",
          description: "You can update your existing entry for today.",
        });
      } else {
        setExistingEntry(null);
      }
    }
  };

  const handleNewEntry = () => {
    setExistingEntry(null);
  };

  // Submit or update entry mutation
  const mutation = useMutation({
    mutationFn: async (entry: {
      name: string;
      email: string;
      num_tickets: number;
    }) => {
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from("lottery_entries")
          .update({
            name: entry.name,
            num_tickets: entry.num_tickets,
          })
          .eq("id", existingEntry.id);
        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase.from("lottery_entries").insert([
          {
            name: entry.name,
            email: entry.email,
            num_tickets: entry.num_tickets,
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-entries"] });
      toast({
        title: "Success",
        description: existingEntry
          ? "Entry updated successfully!"
          : "Entry submitted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit entry. Please try again.",
        variant: "destructive",
      });
      console.error("Entry error:", error);
    },
  });

  return (
    <div className="space-y-8">
      {!lotteryStatus?.is_locked && (
        <>
          <div className="text-center text-sm text-muted-foreground">
            <p>To update an existing entry, simply enter your email address and the form will be pre-filled with your current entry details.</p>
          </div>

          <EntryForm
            existingEntry={existingEntry}
            onSubmit={mutation.mutate}
            onNewEntry={handleNewEntry}
            isSubmitting={mutation.isPending}
            handleEmailChange={handleEmailChange}
          />
        </>
      )}

      {lotteryStatus?.is_locked && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            Today's lottery entries are currently locked. No new entries can be submitted.
          </p>
        </div>
      )}

      {todayEntries && todayEntries.length > 0 && (
        <EntriesTable
          entries={todayEntries}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          page={page}
          totalCount={totalCount || 0}
          entriesPerPage={entriesPerPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
