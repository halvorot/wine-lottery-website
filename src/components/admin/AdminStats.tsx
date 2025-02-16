
import { Users, Timer, Trophy } from "lucide-react";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

interface AdminStatsProps {
  entriesCount: number;
  prizesCount: number;
}

export const AdminStats = ({ entriesCount, prizesCount }: AdminStatsProps) => {
  const { data: activeLottery } = useActiveLottery();
  const [timeLeft, setTimeLeft] = useState("--:--:--");

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!activeLottery) {
        return "--:--:--";
      }

      const drawDate = new Date(activeLottery.draw_date);
      const [hours, minutes, seconds] = activeLottery.draw_time.split(':').map(Number);
      drawDate.setHours(hours, minutes, seconds);

      const now = new Date();
      const diffInSeconds = differenceInSeconds(drawDate, now);

      if (diffInSeconds <= 0) {
        return "00:00:00";
      }

      const hours_ = Math.floor(diffInSeconds / 3600);
      const minutes_ = Math.floor((diffInSeconds % 3600) / 60);
      const seconds_ = diffInSeconds % 60;

      return `${String(hours_).padStart(2, "0")}:${String(minutes_).padStart(2, "0")}:${String(seconds_).padStart(2, "0")}`;
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
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-cream rounded-lg p-6">
        <Users className="mb-2" />
        <h3 className="text-xl font-semibold">Total Entries</h3>
        <p className="text-2xl font-bold">{entriesCount}</p>
      </div>
      <div className="bg-cream rounded-lg p-6">
        <Timer className="mb-2" />
        <h3 className="text-xl font-semibold">Time Left</h3>
        <p className="text-2xl font-bold">{timeLeft}</p>
      </div>
      <div className="bg-cream rounded-lg p-6">
        <Trophy className="mb-2" />
        <h3 className="text-xl font-semibold">Total Prizes</h3>
        <p className="text-2xl font-bold">{prizesCount}</p>
      </div>
    </div>
  );
};
