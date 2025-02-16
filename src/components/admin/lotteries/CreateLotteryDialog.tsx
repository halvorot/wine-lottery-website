
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLotteryMutation = useMutation({
    mutationFn: async () => {
      if (!drawDate) throw new Error("Draw date is required");

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("lotteries")
        .insert({
          draw_date: drawDate.toISOString().split('T')[0],
          created_by: userData.user.id,
          is_completed: false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error("A lottery already exists for this date");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-lottery"] });
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDrawDate(date);
      setTimeout(() => setCalendarOpen(false), 100);
    }
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
            <Popover 
              open={calendarOpen} 
              onOpenChange={setCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  id="drawDate"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !drawDate && "text-muted-foreground"
                  )}
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {drawDate ? format(drawDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-white z-[100] shadow-lg border rounded-md pointer-events-auto select-none" 
                align="start"
                side="bottom"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-0" onClick={(e) => e.stopPropagation()}>
                  <Calendar
                    mode="single"
                    selected={drawDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = startOfDay(new Date());
                      return isBefore(date, today);
                    }}
                    initialFocus
                    className="rounded-md border [&_.rdp-day]:cursor-pointer [&_.rdp-day:not([disabled])]:hover:bg-gray-100 [&_.rdp-button]:pointer-events-auto [&_.rdp-button]:select-none [&_.rdp-button]:cursor-pointer"
                  />
                </div>
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
