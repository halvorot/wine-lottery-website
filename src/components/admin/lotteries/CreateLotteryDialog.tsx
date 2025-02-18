
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
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function CreateLotteryDialog() {
  const [open, setOpen] = useState(false);
  const [drawDate, setDrawDate] = useState<Date>();
  const [drawTime, setDrawTime] = useState("12:00");
  const [password, setPassword] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLotteryMutation = useMutation({
    mutationFn: async () => {
      if (!drawDate) throw new Error("Draw date is required");
      if (!password) throw new Error("Password is required");

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Format the date in YYYY-MM-DD format using the local timezone
      const formattedDate = format(drawDate, 'yyyy-MM-dd');

      const { data: lotteryData, error: lotteryError } = await supabase
        .from("lotteries")
        .insert({
          draw_date: formattedDate,
          draw_time: drawTime,
          created_by: userData.user.id,
          is_completed: false,
        })
        .select()
        .single();

      if (lotteryError) {
        if (lotteryError.code === '23505') { // Unique constraint violation
          throw new Error("A lottery already exists for this date");
        }
        throw lotteryError;
      }

      // Create the lottery password
      const { error: passwordError } = await supabase
        .from("lottery_passwords")
        .insert({
          lottery_id: lotteryData.id,
          password: password,
        });

      if (passwordError) {
        // If password creation fails, delete the lottery to maintain consistency
        await supabase
          .from("lotteries")
          .delete()
          .eq('id', lotteryData.id);
        throw passwordError;
      }

      return lotteryData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-lottery"] });
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Lottery created successfully",
      });
      resetForm();
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

  const resetForm = () => {
    setDrawDate(undefined);
    setDrawTime("12:00");
    setPassword("");
  };

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
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="default">Create New Lottery</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Lottery</DialogTitle>
          <DialogDescription>
            Set up a new lottery event. Choose the draw date, time, and set a password for participants.
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
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="drawTime">Draw Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Input
                id="drawTime"
                type="time"
                value={drawTime}
                onChange={(e) => setDrawTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Lottery Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter lottery password"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!drawDate || !drawTime || !password || createLotteryMutation.isPending}
          >
            {createLotteryMutation.isPending ? "Creating..." : "Create Lottery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
