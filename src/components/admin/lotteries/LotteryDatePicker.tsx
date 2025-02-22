
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface LotteryDatePickerProps {
  drawDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function LotteryDatePicker({ drawDate, onDateChange }: LotteryDatePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setTimeout(() => setCalendarOpen(false), 100);
    }
  };

  const formattedDrawDate = drawDate
    ? new Date(drawDate).toLocaleString('no-NB', { dateStyle: 'long' })
    : 'Pick a date';

  return (
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
            {formattedDrawDate}
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
  );
}
