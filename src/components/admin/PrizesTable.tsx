import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDateNorwegian } from "@/lib/date-utils";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  remaining_quantity: number;
  draw_date: string;
  created_at: string;
}

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

interface PrizesTableProps {
  prizes: Prize[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  page: number;
  totalCount: number;
  entriesPerPage: number;
  onPageChange: (newPage: number) => void;
}

export function PrizesTable({
  prizes,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalCount,
  entriesPerPage,
  onPageChange,
}: PrizesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const { toast } = useToast();
  const totalPages = Math.ceil(totalCount / entriesPerPage);
  
  // Calculate the range of items being displayed
  const startIndex = totalCount === 0 ? 0 : ((page - 1) * entriesPerPage) + 1;
  const endIndex = Math.min(page * entriesPerPage, totalCount);

  const handleDeleteClick = (prize: Prize) => {
    setSelectedPrize(prize);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPrize) return;

    // First check if the prize has been awarded to any winners
    const { data: winnerPrize, error: winnerCheckError } = await supabase
      .from('lottery_winners')
      .select('*')
      .eq('prize_id', selectedPrize.id)
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
      setDeleteDialogOpen(false);
      setSelectedPrize(null);
      return;
    }

    // If not awarded, proceed with deletion
    const { error } = await supabase
      .from("prizes")
      .delete()
      .eq("id", selectedPrize.id);

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
    setDeleteDialogOpen(false);
    setSelectedPrize(null);
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer whitespace-nowrap">
                Prize {renderSortIcon("name")}
              </TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
              <TableHead className="cursor-pointer whitespace-nowrap">
                Qty {renderSortIcon("quantity")}
              </TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap">Remaining</TableHead>
              <TableHead className="cursor-pointer whitespace-nowrap">
                Draw Date {renderSortIcon("draw_date")}
              </TableHead>
              <TableHead className="hidden sm:table-cell cursor-pointer whitespace-nowrap">
                Added {renderSortIcon("created_at")}
              </TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prizes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No prizes found
                </TableCell>
              </TableRow>
            ) : (
              prizes.map((prize) => (
                <TableRow key={prize.id}>
                  <TableCell className="font-medium">{prize.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{prize.description || "-"}</TableCell>
                  <TableCell>{prize.quantity}</TableCell>
                  <TableCell className="hidden sm:table-cell">{prize.remaining_quantity}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateNorwegian(prize.draw_date, "PP")}</TableCell>
                  <TableCell className="hidden sm:table-cell whitespace-nowrap">{formatDateNorwegian(prize.created_at, "PP")}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(prize)}
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

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {totalCount === 0 ? (
            "No prizes found"
          ) : (
            `Showing ${startIndex} to ${endIndex} of ${totalCount} prizes`
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || totalCount === 0}
            className="flex-1 sm:flex-none"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || totalCount === 0}
            className="flex-1 sm:flex-none"
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedPrize?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
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
}
