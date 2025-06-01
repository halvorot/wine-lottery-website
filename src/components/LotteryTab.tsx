
import { Button } from "@/components/ui/button";
import { Wine } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { LotteryEntryForm } from "./LotteryEntryForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";

export const LotteryTab = () => {
  const { data: activeLottery, isLoading } = useActiveLottery();

  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status", activeLottery?.id],
    queryFn: async () => {
      if (!activeLottery) return null;

      const { data, error } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!activeLottery,
  });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block animate-float">
          <Wine size={48} className="text-wine mx-auto mb-4" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-wine to-gold bg-clip-text text-transparent">
          {activeLottery ? "Welcome to The Wine Lottery!" : "Wine Lottery"}
        </h1>
        <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
          {activeLottery 
            ? "Join our exclusive wine lottery for a chance to win premium selections from renowned vineyards."
            : "There is currently no active lottery. Please check back later for our next exciting wine lottery event!"}
        </p>
      </div>

      {isLoading ? (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg w-full">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-wine border-t-transparent rounded-full"></div>
          </div>
        </div>
      ) : activeLottery ? (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg w-full space-y-8">
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-semibold">Next Draw In</h2>
            <CountdownTimer />
          </div>

          {lotteryStatus?.is_locked ? (
            <div className="max-w-md mx-auto text-center p-6 bg-yellow-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-yellow-800">
                Lottery Entries Closed
              </h3>
              <p className="text-yellow-700">
                The lottery is currently locked for the upcoming draw. Please check
                back later for the results!
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Enter the Lottery</h3>
              <LotteryEntryForm />
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg w-full">
          <div className="text-center p-6 bg-cream/50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-wine">
              No Active Lottery
            </h3>
            <p className="text-charcoal/80">
              We're preparing for our next lottery event. Check back soon to participate in our next exclusive wine lottery!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
