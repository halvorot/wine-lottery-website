
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LotteryEntry {
  id: string;
  name: string;
  email: string;
  num_tickets: number;
  created_at: string;
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

  // Query today's entries
  const { data: todayEntries } = useQuery({
    queryKey: ["today-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select("*")
        .eq("entry_date", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LotteryEntry[];
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

  const handleNewEntry = () => {
    setExistingEntry(null);
    setName("");
    setEmail("");
    setNumTickets(1);
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
    <div className="space-y-8">
      <div className="text-center text-sm text-muted-foreground">
        <p>To update an existing entry, simply enter your email address and the form will be pre-filled with your current entry details.</p>
      </div>

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

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-wine hover:bg-wine-light text-white"
          >
            {mutation.isPending
              ? "Submitting..."
              : existingEntry
              ? "Update Entry"
              : "Submit Entry"}
          </Button>
          
          {existingEntry && (
            <Button
              type="button"
              onClick={handleNewEntry}
              variant="outline"
              className="flex-1"
            >
              Add New Entry
            </Button>
          )}
        </div>
      </form>

      {todayEntries && todayEntries.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Today's Entries</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>{entry.num_tickets}</TableCell>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
