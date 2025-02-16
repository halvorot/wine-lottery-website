
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LotteryEntry } from "@/components/lottery/types";
import { useActiveLottery } from "./useActiveLottery";

export function useEntryManagement() {
  const [existingEntry, setExistingEntry] = useState<LotteryEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: activeLottery } = useActiveLottery();

  const checkExistingEntry = async (email: string) => {
    if (!email || !activeLottery) return null;
    
    const { data, error } = await supabase
      .from("lottery_entries")
      .select("*")
      .eq("lottery_id", activeLottery.id)
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Error checking existing entry:", error);
      return null;
    }

    return data;
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    
    if (newEmail) {
      const entry = await checkExistingEntry(newEmail);
      if (entry) {
        setExistingEntry(entry);
        toast({
          title: "Existing Entry Found",
          description: "You can update your existing entry for today.",
        });
      } else {
        setExistingEntry(null);
      }
    }
  };

  const handleNewEntry = () => {
    setExistingEntry(null);
  };

  const mutation = useMutation({
    mutationFn: async (entry: {
      name: string;
      email: string;
      num_tickets: number;
    }) => {
      if (!activeLottery) {
        throw new Error("No active lottery found");
      }

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error("No authenticated user found");
      }

      // Validate new entries
      if (!existingEntry && entry.num_tickets === 0) {
        throw new Error("Number of tickets must be greater than 0 for new entries");
      }

      // Check for existing entry one more time before submitting
      const existingEntryCheck = await checkExistingEntry(entry.email);
      
      if (existingEntryCheck) {
        if (entry.num_tickets === 0) {
          // Delete the entry
          const { error } = await supabase
            .from("lottery_entries")
            .delete()
            .eq("id", existingEntryCheck.id);

          if (error) throw error;
          setExistingEntry(null);
        } else {
          // Update existing entry
          const { error } = await supabase
            .from("lottery_entries")
            .update({
              name: entry.name,
              num_tickets: entry.num_tickets,
            })
            .eq("id", existingEntryCheck.id);

          if (error) throw error;
          
          // Update local state to reflect the changes
          setExistingEntry({
            ...existingEntryCheck,
            name: entry.name,
            num_tickets: entry.num_tickets,
          });
        }
      } else {
        // Insert new entry
        const { error } = await supabase
          .from("lottery_entries")
          .insert([{
            name: entry.name,
            email: entry.email,
            num_tickets: entry.num_tickets,
            created_by: userId,
            lottery_id: activeLottery.id,
          }]);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["today-entries"] });
      queryClient.invalidateQueries({ queryKey: ["recent-entries"] });
      if (existingEntry && variables.num_tickets === 0) {
        toast({
          title: "Entry Deleted",
          description: `${variables.name}'s entry has been deleted.`,
        });
      } else {
        toast({
          title: existingEntry ? "Entry Updated!" : "Entry Submitted!",
          description: `${variables.name} is now entered in today's lottery with ${variables.num_tickets} ticket${variables.num_tickets !== 1 ? 's' : ''}. Good luck! 🍷`,
        });
      }
    },
    onError: (error: Error) => {
      if (error.message === "Number of tickets must be greater than 0 for new entries") {
        toast({
          title: "Invalid Entry",
          description: "Number of tickets must be greater than 0 for new entries.",
          variant: "destructive",
        });
      } else if (error.message === "No active lottery found") {
        toast({
          title: "No Active Lottery",
          description: "There is currently no active lottery to enter.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit entry. Please try again.",
          variant: "destructive",
        });
      }
      console.error("Entry error:", error);
    },
  });

  return {
    existingEntry,
    handleEmailChange,
    handleNewEntry,
    mutation,
  };
}
