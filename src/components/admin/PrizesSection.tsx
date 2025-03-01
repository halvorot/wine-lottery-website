import { AddPrizeForm } from "@/components/AddPrizeForm";
import { PrizesTable } from "@/components/admin/prizes/PrizesTable";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { formatDateNorwegian, formatDateForApi } from "@/lib/date-utils";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  draw_date: string;
  created_at: string;
}

type SortColumn = "name" | "price" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

interface PrizesSectionProps {
  prizes: Prize[];
  isLoading: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  page: number;
  totalCount: number;
  entriesPerPage: number;
  onSort: (column: SortColumn) => void;
  onPageChange: (page: number) => void;
  selectedDate: string | "all";
  onDateChange: (date: string | "all") => void;
}

export const PrizesSection = ({
  prizes,
  isLoading,
  sortColumn,
  sortDirection,
  page,
  totalCount,
  entriesPerPage,
  onSort,
  onPageChange,
  selectedDate,
  onDateChange,
}: PrizesSectionProps) => {
  const [date, setDate] = useState<Date | undefined>(
    selectedDate === "all" ? undefined : new Date(selectedDate)
  );

  const handleTodayClick = () => {
    const today = new Date();
    setDate(today);
    onDateChange(formatDateForApi(today));
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      return;
    }
    setDate(newDate);
    onDateChange(formatDateForApi(newDate));
  };

  return (
    <div className="space-y-8">
      <div className="bg-cream/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Prize</h3>
        <AddPrizeForm />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="text-xl font-semibold">Prize List</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1 sm:flex-none min-w-[120px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDateNorwegian(date, "PP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-white z-50 shadow-lg border rounded-md" 
                align="center"
                sideOffset={4}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2 min-w-[280px] max-w-[95vw]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="bg-white"
                  />
                </div>
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
              onClick={() => {
                setDate(undefined);
                onDateChange("all");
              }}
              className="flex-1 sm:flex-none"
            >
              Show All Dates
            </Button>
          </div>
        </div>

        {!isLoading && (
          <PrizesTable
            prizes={prizes}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
            page={page}
            totalCount={totalCount}
            entriesPerPage={entriesPerPage}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};
