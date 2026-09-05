
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
    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-[clamp(1rem,7vw,2.25rem)] sm:text-4xl font-bold text-charcoal">
      <div className="flex min-w-0 flex-col items-center">
        <span className="w-full min-w-0 rounded-lg bg-cream px-1 py-3 text-center leading-none tracking-tight sm:min-w-[80px] sm:p-4">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="mt-2 text-sm">Hours</span>
      </div>
      <div className="flex min-w-0 flex-col items-center">
        <span className="w-full min-w-0 rounded-lg bg-cream px-1 py-3 text-center leading-none tracking-tight sm:min-w-[80px] sm:p-4">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="mt-2 text-sm">Minutes</span>
      </div>
      <div className="flex min-w-0 flex-col items-center">
        <span className="w-full min-w-0 rounded-lg bg-cream px-1 py-3 text-center leading-none tracking-tight sm:min-w-[80px] sm:p-4">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="mt-2 text-sm">Seconds</span>
      </div>
    </div>
  );
};
