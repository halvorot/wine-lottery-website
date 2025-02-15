
import { Button } from "@/components/ui/button";
import { Wine } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { LotteryEntryForm } from "./LotteryEntryForm";

export const LotteryTab = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block animate-float">
          <Wine size={48} className="text-wine mx-auto mb-4" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-wine to-gold bg-clip-text text-transparent">
          Welcome to Today's Wine Lottery!
        </h1>
        <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
          Join our exclusive wine lottery for a chance to win premium selections
          from renowned vineyards.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg w-full space-y-8">
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-semibold">Next Draw In</h2>
          <CountdownTimer />
        </div>

        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Enter the Lottery</h3>
          <LotteryEntryForm />
        </div>
      </div>
    </div>
  );
};
