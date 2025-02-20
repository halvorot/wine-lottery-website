
import { EntryForm } from "./lottery/EntryForm";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useEntryManagement } from "@/hooks/useEntryManagement";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function LotteryEntryForm() {
  const isAuthenticated = useAuthStatus();
  const { data: activeLottery } = useActiveLottery();
  
  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status", activeLottery?.id],
    queryFn: async () => {
      if (!activeLottery) return null;
      
      const { data, error } = await supabase
        .rpc('is_lottery_locked', { target_lottery_id: activeLottery.id });

      if (error) throw error;
      return { is_locked: data };
    },
    enabled: !!activeLottery,
  });

  const {
    existingEntry,
    handleEmailChange,
    handleNewEntry,
    mutation,
  } = useEntryManagement();

  if (!isAuthenticated) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          Please sign in to submit or view lottery entries.
        </p>
      </div>
    );
  }

  if (!activeLottery) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          There is currently no active lottery. Please check back later!
        </p>
      </div>
    );
  }

  // Check if lottery has reached draw time
  const hasReachedDrawTime = new Date(`${activeLottery.draw_date}T${activeLottery.draw_time}`) <= new Date();

  return (
    <div className="space-y-8">
      {!lotteryStatus?.is_locked && !hasReachedDrawTime && (
        <>
          <div className="text-center text-sm text-muted-foreground">
            <p>To update an existing entry, simply enter your email address and the form will be pre-filled with your current entry details.</p>
          </div>

          <EntryForm
            existingEntry={existingEntry}
            onSubmit={mutation.mutate}
            onNewEntry={handleNewEntry}
            isSubmitting={mutation.isPending}
            handleEmailChange={handleEmailChange}
          />
        </>
      )}

      {(lotteryStatus?.is_locked || hasReachedDrawTime) && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            {hasReachedDrawTime 
              ? "This lottery's draw time has passed. No new entries can be submitted."
              : "Today's lottery entries are currently locked. No new entries can be submitted."}
          </p>
        </div>
      )}
    </div>
  );
}
