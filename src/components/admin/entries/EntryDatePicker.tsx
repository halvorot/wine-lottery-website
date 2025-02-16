
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EntryDatePickerProps {
  selectedDate: string | "all";
  onDateChange: (date: string | "all") => void;
}

export const EntryDatePicker = ({
  selectedDate,
  onDateChange,
}: EntryDatePickerProps) => {
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    // Subtract the timezone offset to ensure we get the correct date
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onDateChange(adjustedDate.toISOString().split("T")[0]);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
    onDateChange(adjustedDate.toISOString().split("T")[0]);
  };

  const handleShowAllDates = () => {
    onDateChange("all");
  };

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal flex-1 sm:flex-none",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate === "all" ? "All Dates" : format(new Date(selectedDate), "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white">
          <Calendar
            mode="single"
            selected={selectedDate === "all" ? undefined : new Date(selectedDate)}
            onSelect={handleDateSelect}
            initialFocus
            className="bg-white"
          />
        </PopoverContent>
      </Popover>
      <Button 
        variant="outline"
        onClick={handleTodayClick}
        className="flex-1 sm:flex-none"
      >
        Today
      </Button>
      <Button 
        variant="outline"
        onClick={handleShowAllDates}
        className="flex-1 sm:flex-none"
      >
        All Dates
      </Button>
    </div>
  );
};
