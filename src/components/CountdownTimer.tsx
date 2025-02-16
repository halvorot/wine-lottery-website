
import { useEffect, useState } from "react";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { differenceInSeconds } from "date-fns";

export const CountdownTimer = () => {
  const { data: activeLottery } = useActiveLottery();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!activeLottery) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const drawDate = new Date(activeLottery.draw_date);
      const [hours, minutes, seconds] = activeLottery.draw_time.split(':').map(Number);
      drawDate.setHours(hours, minutes, seconds);

      const now = new Date();
      const diffInSeconds = differenceInSeconds(drawDate, now);

      if (diffInSeconds <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(diffInSeconds / 3600),
        minutes: Math.floor((diffInSeconds % 3600) / 60),
        seconds: diffInSeconds % 60,
      };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    // Initial calculation
    updateTimer();

    // Update every second
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [activeLottery]);

  return (
    <div className="flex gap-4 text-4xl font-bold text-charcoal justify-center">
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px] text-center">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px] text-center">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px] text-center">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Seconds</span>
      </div>
    </div>
  );
};
