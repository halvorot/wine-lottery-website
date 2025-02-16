
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
}

interface DeleteEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntry: Entry | null;
  onEntryDeleted: () => void;
}

export const DeleteEntryDialog = ({
  open,
  onOpenChange,
  selectedEntry,
  onEntryDeleted,
}: DeleteEntryDialogProps) => {
  const { toast } = useToast();

  const handleConfirmDelete = async () => {
    if (!selectedEntry) return;

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
      onOpenChange(false);
      return;
    }

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
      onEntryDeleted();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
  );
};
