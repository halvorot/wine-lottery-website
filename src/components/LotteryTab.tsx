
import { Button } from "@/components/ui/button";
import { Wine } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { LotteryEntryForm } from "./LotteryEntryForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const LotteryTab = () => {
  const queryClient = useQueryClient();

  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      // First try to get today's lottery status
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", today)
        .single();

      // If no status exists for today, create one
      if (error?.code === "PGRST116") {
        const { data: newStatus, error: createError } = await supabase
          .from("lottery_status")
          .insert([
            {
              date: today,
              is_locked: false,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        return newStatus;
      }

      if (error) throw error;
      return data;
    },
  });

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
    </div>
  );
};
