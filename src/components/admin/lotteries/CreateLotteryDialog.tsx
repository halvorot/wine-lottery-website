
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
import { useState } from "react";
import { LotteryDatePicker } from "./LotteryDatePicker";
import { LotteryTimePicker } from "./LotteryTimePicker";
import { LotteryPasswordInput } from "./LotteryPasswordInput";
import { useLotteryCreation } from "@/hooks/useLotteryCreation";

export function CreateLotteryDialog() {
  const [open, setOpen] = useState(false);
  const [drawDate, setDrawDate] = useState<Date>();
  const [drawTime, setDrawTime] = useState("12:00");
  const [password, setPassword] = useState("");

  const createLotteryMutation = useLotteryCreation();

  const resetForm = () => {
    setDrawDate(undefined);
    setDrawTime("12:00");
    setPassword("");
  };

  const handleCreate = () => {
    if (!drawDate || !password) return;
    createLotteryMutation.mutate(
      { drawDate, drawTime, password },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      }
    );
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
          <LotteryDatePicker 
            drawDate={drawDate} 
            onDateChange={setDrawDate} 
          />
          <LotteryTimePicker 
            drawTime={drawTime} 
            onTimeChange={setDrawTime} 
          />
          <LotteryPasswordInput 
            password={password} 
            onPasswordChange={setPassword} 
          />
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
