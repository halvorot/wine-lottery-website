import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LotteryDetails } from "./LotteryDetails";

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
}

export function LotteryItem({ lottery, onDelete }: LotteryItemProps) {
  const formattedDateTime = lottery.draw_date && lottery.draw_time
    ? new Date(`${lottery.draw_date}T${lottery.draw_time}`).toLocaleString('no-NB', {
        dateStyle: 'long',
        timeStyle: 'short',
        hour12: false
      })
    : 'Not set';

  return (
    <AccordionItem value={lottery.id}>
      <div className="flex items-center justify-between">
        <AccordionTrigger className="flex-1 py-4 px-2">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                Draw Date: {formattedDateTime}
              </p>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                lottery.lottery_status?.is_locked 
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {lottery.lottery_status?.is_locked ? "Locked" : "Open"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Status: {lottery.is_completed ? "Completed" : "Upcoming"}
            </p>
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
      <AccordionContent>
        <LotteryDetails lottery={lottery} />
      </AccordionContent>
    </AccordionItem>
  );
}
