
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Prize {
  id: string;
  name: string;
}

interface DeletePrizeDialogProps {
  prize: Prize | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePrizeDialog({ prize, open, onOpenChange }: DeletePrizeDialogProps) {
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    if (!prize) return;

    // First check if the prize has been awarded to any winners
    const { data: winnerPrize, error: winnerCheckError } = await supabase
      .from('lottery_winners')
      .select('*')
      .eq('prize_id', prize.id)
      .maybeSingle();

    if (winnerCheckError) {
      toast({
        title: "Error",
        description: "Failed to check prize status. Please try again.",
        variant: "destructive",
      });
      console.error("Winner check error:", winnerCheckError);
      return;
    }

    if (winnerPrize) {
      toast({
        title: "Cannot Delete Prize",
        description: "This prize cannot be deleted because it has been awarded to a winner.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    // If not awarded, proceed with deletion
    const { error } = await supabase
      .from("prizes")
      .delete()
      .eq("id", prize.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete the prize. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    } else {
      toast({
        title: "Success",
        description: "Prize deleted successfully",
      });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {prize?.name}. This action cannot be undone.
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
  );
}
