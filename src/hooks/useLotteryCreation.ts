
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface CreateLotteryParams {
  drawDate: Date;
  drawTime: string;
  password: string;
}

export function useLotteryCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ drawDate, drawTime, password }: CreateLotteryParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const formattedDate = format(drawDate, 'yyyy-MM-dd');

      const { data: lotteryData, error: lotteryError } = await supabase
        .from("lotteries")
        .insert({
          draw_date: formattedDate,
          draw_time: drawTime,
          created_by: userData.user.id,
          is_completed: false,
        })
        .select()
        .single();

      if (lotteryError) {
        if (lotteryError.code === '23505') {
          throw new Error("A lottery already exists for this date");
        }
        throw lotteryError;
      }

      const { error: passwordError } = await supabase
        .from("lottery_passwords")
        .insert({
          lottery_id: lotteryData.id,
          password: password,
        });

      if (passwordError) {
        await supabase
          .from("lotteries")
          .delete()
          .eq('id', lotteryData.id);
        throw passwordError;
      }

      return lotteryData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-lottery"] });
      queryClient.invalidateQueries({ queryKey: ["lotteries"] });
      toast({
        title: "Success",
        description: "Lottery created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating lottery:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lottery. Please try again.",
        variant: "destructive",
      });
    },
  });
}
