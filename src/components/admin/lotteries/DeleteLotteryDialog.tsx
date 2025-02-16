
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface DeleteLotteryDialogProps {
  lotteryId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLotteryDialog({ lotteryId, onOpenChange }: DeleteLotteryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      onOpenChange(false);
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

  return (
    <AlertDialog open={!!lotteryId} onOpenChange={onOpenChange}>
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
              if (lotteryId) {
                deleteLotteryMutation.mutate(lotteryId);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
