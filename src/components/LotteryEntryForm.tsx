
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LotteryEntry {
  id: string;
  name: string;
  email: string;
  num_tickets: number;
}

export function LotteryEntryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [numTickets, setNumTickets] = useState(1);
  const [existingEntry, setExistingEntry] = useState<LotteryEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query lottery status
  const { data: lotteryStatus } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", new Date().toISOString().split("T")[0])
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Query existing entry when email changes
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

  // Handle email change
  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail) {
      const entry = await checkExistingEntry(newEmail);
      if (entry) {
        setExistingEntry(entry);
        setName(entry.name);
        setNumTickets(entry.num_tickets);
        toast({
          title: "Existing Entry Found",
          description: "You can update your existing entry for today.",
        });
      } else {
        setExistingEntry(null);
      }
    }
  };

  // Submit or update entry mutation
  const mutation = useMutation({
    mutationFn: async (entry: {
      name: string;
      email: string;
      num_tickets: number;
      id?: string;
    }) => {
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from("lottery_entries")
          .update({
            name: entry.name,
            num_tickets: entry.num_tickets,
          })
          .eq("id", existingEntry.id);
        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase.from("lottery_entries").insert([
          {
            name: entry.name,
            email: entry.email,
            num_tickets: entry.num_tickets,
          },
        ]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-entries"] });
      toast({
        title: "Success",
        description: existingEntry
          ? "Entry updated successfully!"
          : "Entry submitted successfully!",
      });
      if (!existingEntry) {
        setName("");
        setEmail("");
        setNumTickets(1);
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      email,
      num_tickets: numTickets,
    });
  };

  if (lotteryStatus?.is_locked) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          Today's lottery entries are currently locked. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          required
          placeholder="Your email"
          className="w-full"
          disabled={existingEntry !== null}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="tickets" className="block text-sm font-medium mb-1">
          Number of Tickets
        </label>
        <Input
          id="tickets"
          type="number"
          min="1"
          max="10"
          value={numTickets}
          onChange={(e) => setNumTickets(parseInt(e.target.value, 10))}
          required
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-wine hover:bg-wine-light"
      >
        {mutation.isPending
          ? "Submitting..."
          : existingEntry
          ? "Update Entry"
          : "Submit Entry"}
      </Button>
    </form>
  );
}
