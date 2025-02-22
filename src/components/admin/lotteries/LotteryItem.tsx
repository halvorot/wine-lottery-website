
import { format } from "date-fns";
import { CalendarCheck, Calendar, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LotteryDetails } from "./LotteryDetails";
import { cn } from "@/lib/utils";

interface Lottery {
  id: string;
  draw_date: string;
  draw_time: string;
  is_completed: boolean;
  lottery_status: {
    is_locked: boolean;
  };
}

interface LotteryItemProps {
  lottery: Lottery;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

export function LotteryItem({ lottery, onDelete, isActive }: LotteryItemProps) {
  const drawDateTime = new Date(`${lottery.draw_date}T${lottery.draw_time}`);
  const isPast = drawDateTime < new Date();
  
  const formattedDateTime = lottery.draw_date && lottery.draw_time
    ? new Date(`${lottery.draw_date}T${lottery.draw_time}`).toLocaleString('no-NB', {
        dateStyle: 'long',
        timeStyle: 'short',
        hour12: false
      })
    : 'Not set';

  return (
    <AccordionItem value={lottery.id} className={cn(
      "border rounded-lg mb-4 overflow-hidden",
      isActive && "border-2 border-green-500 bg-green-50",
      !isActive && isPast && "bg-gray-50",
      !isActive && !isPast && "bg-white"
    )}>
      <div className="flex items-center justify-between">
        <AccordionTrigger className="flex-1 py-4 px-4 hover:no-underline">
          <div className="flex flex-col items-start gap-2 w-full">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <Zap className="h-5 w-5 text-green-600" />
                ) : isPast ? (
                  <CalendarCheck className="h-5 w-5 text-gray-400" />
                ) : (
                  <Calendar className="h-5 w-5 text-blue-500" />
                )}
                <p className="font-medium">
                  {formattedDateTime}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <span className={cn(
                  "text-sm px-3 py-1 rounded-full font-medium",
                  lottery.lottery_status?.is_locked 
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                )}>
                  {lottery.lottery_status?.is_locked ? "Locked" : "Open"}
                </span>
                <span className={cn(
                  "text-sm px-3 py-1 rounded-full font-medium",
                  isPast
                    ? "bg-gray-100 text-gray-700"
                    : isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                )}>
                  {isPast ? "Past" : isActive ? "Active" : "Upcoming"}
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive/90 mr-4"
          onClick={() => onDelete(lottery.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <AccordionContent className="px-4">
        <LotteryDetails lottery={lottery} />
      </AccordionContent>
    </AccordionItem>
  );
}
