
import { AddPrizeForm } from "@/components/AddPrizeForm";
import { PrizesTable } from "@/components/admin/PrizesTable";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-8">
      <div className="bg-cream/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Prize</h3>
        <AddPrizeForm />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Prize List</h3>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate) {
                    onDateChange(format(newDate, "yyyy-MM-dd"));
                  }
                }}
                initialFocus
                className="bg-white"
              />
            </PopoverContent>
          </Popover>
          <Button 
            variant="outline" 
            onClick={() => {
              setDate(undefined);
              onDateChange("all");
            }}
          >
            Show All Dates
          </Button>
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
