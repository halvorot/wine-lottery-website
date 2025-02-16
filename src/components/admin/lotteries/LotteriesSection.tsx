
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreateLotteryDialog } from "./CreateLotteryDialog";
import { Loader2, Trash2, Table, Lock, Unlock } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { DataTable } from "../table/DataTable";
import { useToggleLottery } from "@/hooks/useToggleLottery";

interface Lottery {
  id: string;
  draw_date: string;
  created_at: string;
  is_completed: boolean;
  lottery_status: {
    is_locked: boolean;
  };
}

interface Prize {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  remaining_quantity: number;
  created_at: string;
}

interface Entry {
  id: string;
  name: string;
  email: string;
  num_tickets: number;
  created_at: string;
}

export function LotteriesSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingLotteryId, setDeletingLotteryId] = useState<string | null>(null);
  const toggleLockMutation = useToggleLottery();

  const { data: lotteries, isLoading } = useQuery({
    queryKey: ["lotteries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotteries")
        .select(`
          *,
          lottery_status (
            is_locked
          )
        `)
        .order("draw_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const useLotteryDetails = (lotteryId: string) => {
    const { data: prizes } = useQuery({
      queryKey: ["prizes", lotteryId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("prizes")
          .select("*")
          .eq("lottery_id", lotteryId);

        if (error) throw error;
        return data as Prize[];
      },
    });

    const { data: entries } = useQuery({
      queryKey: ["entries", lotteryId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("lottery_entries")
          .select("*")
          .eq("lottery_id", lotteryId);

        if (error) throw error;
        return data as Entry[];
      },
    });

    return { prizes, entries };
  };

  const deleteLotteryMutation = useMutation({
    mutationFn: async (lotteryId: string) => {
      const { error } = await supabase
        .from("lotteries")
        .delete()
        .eq("id", lotteryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
      toast({
        title: "Success",
        description: "Lottery deleted successfully",
      });
      setDeletingLotteryId(null);
    },
    onError: (error) => {
      console.error("Error deleting lottery:", error);
      toast({
        title: "Error",
        description: "Failed to delete lottery. Please try again.",
        variant: "destructive",
      });
    },
  });

  const LotteryDetails = ({ lottery }: { lottery: any }) => {
    const [prizesPage, setPrizesPage] = useState(1);
    const [entriesPage, setEntriesPage] = useState(1);
    const [prizeSort, setPrizeSort] = useState<{ column: string; direction: "asc" | "desc" }>({
      column: "name",
      direction: "asc",
    });
    const [entrySort, setEntrySort] = useState<{ column: string; direction: "asc" | "desc" }>({
      column: "created_at",
      direction: "desc",
    });
    const entriesPerPage = 5;

    const { prizes, entries } = useLotteryDetails(lottery.id);

    const handlePrizeSort = (column: string) => {
      setPrizeSort((prev) => ({
        column,
        direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
      }));
      setPrizesPage(1);
    };

    const handleEntrySort = (column: string) => {
      setEntrySort((prev) => ({
        column,
        direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
      }));
      setEntriesPage(1);
    };

    const sortedPrizes = prizes?.sort((a, b) => {
      const aValue = (a as any)[prizeSort.column];
      const bValue = (b as any)[prizeSort.column];
      return prizeSort.direction === "asc" 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

    const sortedEntries = entries?.sort((a, b) => {
      const aValue = (a as any)[entrySort.column];
      const bValue = (b as any)[entrySort.column];
      return entrySort.direction === "asc"
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

    const paginatedPrizes = sortedPrizes?.slice(
      (prizesPage - 1) * entriesPerPage,
      prizesPage * entriesPerPage
    );

    const paginatedEntries = sortedEntries?.slice(
      (entriesPage - 1) * entriesPerPage,
      entriesPage * entriesPerPage
    );

    const prizeColumns = [
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description" },
      { key: "quantity", label: "Quantity", sortable: true },
      { key: "remaining_quantity", label: "Remaining" },
    ];

    const entryColumns = [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "num_tickets", label: "Tickets", sortable: true },
      { 
        key: "created_at", 
        label: "Entry Time", 
        sortable: true,
        render: (entry: Entry) => format(new Date(entry.created_at), "PPP p")
      },
    ];

    return (
      <div className="space-y-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => toggleLockMutation.mutate(lottery.id)}
              disabled={toggleLockMutation.isPending}
              variant="outline"
              className={lottery.lottery_status?.is_locked ? "text-green-600" : "text-red-600"}
            >
              {lottery.lottery_status?.is_locked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" /> Unlock Lottery
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Lock Lottery
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Status: {lottery.lottery_status?.is_locked ? "Locked" : "Open"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <h4 className="font-semibold">Prizes</h4>
          </div>
          <DataTable
            data={paginatedPrizes || []}
            columns={prizeColumns}
            sortColumn={prizeSort.column}
            sortDirection={prizeSort.direction}
            onSort={handlePrizeSort}
            page={prizesPage}
            totalCount={prizes?.length || 0}
            entriesPerPage={entriesPerPage}
            onPageChange={setPrizesPage}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <h4 className="font-semibold">Entries</h4>
          </div>
          <DataTable
            data={paginatedEntries || []}
            columns={entryColumns}
            sortColumn={entrySort.column}
            sortDirection={entrySort.direction}
            onSort={handleEntrySort}
            page={entriesPage}
            totalCount={entries?.length || 0}
            entriesPerPage={entriesPerPage}
            onPageChange={setEntriesPage}
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Lotteries</h3>
        <CreateLotteryDialog />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {lotteries?.map((lottery) => (
          <AccordionItem key={lottery.id} value={lottery.id}>
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 py-4 px-2">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      Draw Date: {format(new Date(lottery.draw_date), "PPP")}
                    </p>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      lottery.lottery_status?.is_locked 
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {lottery.lottery_status?.is_locked ? "Locked" : "Open"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Status: {lottery.is_completed ? "Completed" : "Upcoming"}
                  </p>
                </div>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 mr-4"
                onClick={() => setDeletingLotteryId(lottery.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <AccordionContent>
              <LotteryDetails lottery={lottery} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {(!lotteries || lotteries.length === 0) && (
        <p className="text-center text-muted-foreground py-8">
          No lotteries found. Create one to get started.
        </p>
      )}

      <AlertDialog
        open={!!deletingLotteryId}
        onOpenChange={(open) => !open && setDeletingLotteryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lottery
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingLotteryId) {
                  deleteLotteryMutation.mutate(deletingLotteryId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
