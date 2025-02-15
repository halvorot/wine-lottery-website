
import { Trophy, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface WinnerAnnouncementProps {
  winner: {
    name: string;
    prizeName: string;
  } | null;
}

export const WinnerAnnouncement = ({ winner }: WinnerAnnouncementProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (winner) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  if (!winner || !show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-4 animate-scale-in">
        <div className="flex justify-center space-x-2">
          <Sparkles className="text-gold animate-bounce" size={32} />
          <Trophy className="text-gold" size={48} />
          <Sparkles className="text-gold animate-bounce" size={32} />
        </div>
        <h2 className="text-2xl font-bold">Congratulations!</h2>
        <p className="text-xl">
          <span className="font-semibold">{winner.name}</span> has won
        </p>
        <p className="text-gold text-2xl font-bold">{winner.prizeName}</p>
      </div>
    </div>
  );
};
