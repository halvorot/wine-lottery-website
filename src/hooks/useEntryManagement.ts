
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LotteryEntry } from "@/components/lottery/types";

export function useEntryManagement() {
  const [existingEntry, setExistingEntry] = useState<LotteryEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkExistingEntry = async (email: string) => {
    if (!email) return null;
    
    const { data, error } = await supabase
      .from("lottery_entries")
      .select("*")
      .eq("entry_date", new Date().toISOString().split("T")[0])
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error("No authenticated user found");
      }

      if (existingEntry) {
        const { error } = await supabase
          .from("lottery_entries")
          .update({
            name: entry.name,
            num_tickets: entry.num_tickets,
          })
          .eq("id", existingEntry.id)
          .eq("created_by", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("lottery_entries").insert([
          {
            name: entry.name,
            email: entry.email,
            num_tickets: entry.num_tickets,
            created_by: userId,
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["today-entries"] });
      queryClient.invalidateQueries({ queryKey: ["recent-entries"] });
      toast({
        title: existingEntry ? "Entry Updated!" : "Entry Submitted!",
        description: `${variables.name} is now entered in today's lottery with ${variables.num_tickets} ticket${variables.num_tickets !== 1 ? 's' : ''}. Good luck! 🍷`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit entry. Please try again.",
        variant: "destructive",
      });
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
