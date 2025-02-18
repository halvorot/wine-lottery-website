
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface LotteryTimePickerProps {
  drawTime: string;
  onTimeChange: (time: string) => void;
}

export function LotteryTimePicker({ drawTime, onTimeChange }: LotteryTimePickerProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="drawTime">Draw Time</Label>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <Input
          id="drawTime"
          type="time"
          value={drawTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}
