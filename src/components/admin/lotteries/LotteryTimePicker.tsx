import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface LotteryTimePickerProps {
  drawTime: string;
  onTimeChange: (time: string) => void;
}

export function LotteryTimePicker({ drawTime, onTimeChange }: LotteryTimePickerProps) {
  // Split time into hours and minutes
  const [hours, minutes] = drawTime ? drawTime.split(':') : ['00', '00'];

  // Generate hours and minutes options
  const hoursOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  const minutesOptions = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  );

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const newTime = type === 'hours' 
      ? `${value}:${minutes}`
      : `${hours}:${value}`;
    onTimeChange(newTime);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="drawTime">Draw Time</Label>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <div className="flex gap-2 w-full">
          <Select value={hours} onValueChange={(value) => handleTimeChange('hours', value)}>
            <SelectTrigger className="w-full sm:w-[80px] bg-background">
              <SelectValue placeholder="Hours" />
            </SelectTrigger>
            <SelectContent className="bg-background max-h-[40vh] overflow-y-auto">
              {hoursOptions.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="flex items-center">:</span>
          <Select value={minutes} onValueChange={(value) => handleTimeChange('minutes', value)}>
            <SelectTrigger className="w-full sm:w-[80px] bg-background">
              <SelectValue placeholder="Minutes" />
            </SelectTrigger>
            <SelectContent className="bg-background max-h-[40vh] overflow-y-auto">
              {minutesOptions.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
