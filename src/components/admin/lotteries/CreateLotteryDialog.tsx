
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreateLotteryDialog() {
  const [open, setOpen] = useState(false);
  const [drawDate, setDrawDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLotteryMutation = useMutation({
    mutationFn: async () => {
      if (!drawDate) throw new Error("Draw date is required");

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // First check if there are any active lotteries
      const { data: existingLotteries } = await supabase
        .from("lotteries")
        .select("id")
        .eq("is_active", true)
        .limit(1);

      // If there are active lotteries, throw an error
      if (existingLotteries && existingLotteries.length > 0) {
        throw new Error("There is already an active lottery");
      }

      const { data, error } = await supabase
        .from("lotteries")
        .insert({
          draw_date: drawDate.toISOString().split('T')[0],
          is_active: true,
          created_by: userData.user.id,
          is_completed: false, // explicitly set is_completed
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-lottery"] });
      queryClient.invalidateQueries({ queryKey: ["lotteries"] }); // Also invalidate the lotteries list
      setOpen(false);
      toast({
        title: "Success",
        description: "Lottery created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating lottery:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lottery. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    createLotteryMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create New Lottery</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Lottery</DialogTitle>
          <DialogDescription>
            Set up a new lottery event. Choose the draw date carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="drawDate">Draw Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !drawDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {drawDate ? format(drawDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0" 
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={drawDate}
                  onSelect={setDrawDate}
                  disabled={(date) => {
                    const today = startOfDay(new Date());
                    return isBefore(date, today);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!drawDate || createLotteryMutation.isPending}
          >
            {createLotteryMutation.isPending ? "Creating..." : "Create Lottery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
