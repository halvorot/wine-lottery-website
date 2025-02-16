
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useToggleLottery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lotteryId: string) => {
      const { data: currentStatus } = await supabase
        .from("lottery_status")
        .select("is_locked")
        .eq("lottery_id", lotteryId)
        .single();
      
      const newLockedStatus = !currentStatus?.is_locked;
      
      const { data, error } = await supabase
        .from("lottery_status")
        .update({ 
          is_locked: newLockedStatus,
          locked_at: newLockedStatus ? new Date().toISOString() : null
        })
        .eq("lottery_id", lotteryId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data.is_locked;
    },
    onSuccess: (newLockedStatus) => {
      queryClient.invalidateQueries({ queryKey: ["lottery-status"] });
      toast({
        title: "Success",
        description: `Lottery ${newLockedStatus ? "locked" : "unlocked"} successfully!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lottery status. Please try again.",
        variant: "destructive",
      });
      console.error("Toggle lock error:", error);
    },
  });
}
