
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreateLotteryDialog } from "./CreateLotteryDialog";
import { Loader2, Trash2, ChevronDown, Table } from "lucide-react";
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
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface Lottery {
  id: string;
  draw_date: string;
  created_at: string;
  is_completed: boolean;
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

  const { data: lotteries, isLoading } = useQuery({
    queryKey: ["lotteries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotteries")
        .select("*")
        .order("draw_date", { ascending: false });

      if (error) throw error;
      return data as Lottery[];
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

  const LotteryDetails = ({ lottery }: { lottery: Lottery }) => {
    const { prizes, entries } = useLotteryDetails(lottery.id);

    return (
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <h4 className="font-semibold">Prizes</h4>
          </div>
          <UITable>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prizes?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No prizes found
                  </TableCell>
                </TableRow>
              )}
              {prizes?.map((prize) => (
                <TableRow key={prize.id}>
                  <TableCell>{prize.name}</TableCell>
                  <TableCell>{prize.description || "-"}</TableCell>
                  <TableCell>{prize.quantity}</TableCell>
                  <TableCell>{prize.remaining_quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <h4 className="font-semibold">Entries</h4>
          </div>
          <UITable>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Entry Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No entries found
                  </TableCell>
                </TableRow>
              )}
              {entries?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.num_tickets}</TableCell>
                  <TableCell>{format(new Date(entry.created_at), "PPP p")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UITable>
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
              <AccordionTrigger className="flex-1">
                <div className="flex flex-col items-start">
                  <p className="font-medium">
                    Draw Date: {format(new Date(lottery.draw_date), "PPP")}
                  </p>
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
