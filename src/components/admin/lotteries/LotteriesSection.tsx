
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreateLotteryDialog } from "./CreateLotteryDialog";
import { Loader2, Trash2 } from "lucide-react";
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
import { useState } from "react";

interface Lottery {
  id: string;
  draw_date: string;
  created_at: string;
  is_completed: boolean;
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

      <div className="grid gap-4">
        {lotteries?.map((lottery) => (
          <div
            key={lottery.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div className="space-y-1">
              <p className="font-medium">
                Draw Date: {format(new Date(lottery.draw_date), "PPP")}
              </p>
              <p className="text-sm text-muted-foreground">
                Created: {format(new Date(lottery.created_at), "PPP p")}
              </p>
              <p className="text-sm">
                Status: {lottery.is_completed ? "Completed" : "Upcoming"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90"
                onClick={() => setDeletingLotteryId(lottery.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!lotteries || lotteries.length === 0) && (
          <p className="text-center text-muted-foreground py-8">
            No lotteries found. Create one to get started.
          </p>
        )}
      </div>

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
