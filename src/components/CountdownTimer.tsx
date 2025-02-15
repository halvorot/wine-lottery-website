
import { useEffect, useState } from "react";

export const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 4, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        const totalSeconds =
          prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds - 1;
        if (totalSeconds < 0) return { hours: 4, minutes: 0, seconds: 0 };
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 text-4xl font-bold text-charcoal justify-center">
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px] text-center">
          {String(time.hours).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px] text-center">
          {String(time.minutes).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px] text-center">
          {String(time.seconds).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Seconds</span>
      </div>
    </div>
  );
};
