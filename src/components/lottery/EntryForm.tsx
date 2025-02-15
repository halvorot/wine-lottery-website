
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LotteryEntry } from "./types";

interface EntryFormProps {
  existingEntry: LotteryEntry | null;
  onSubmit: (data: { name: string; email: string; num_tickets: number }) => void;
  onNewEntry: () => void;
  isSubmitting: boolean;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EntryForm({
  existingEntry,
  onSubmit,
  onNewEntry,
  isSubmitting,
  handleEmailChange,
}: EntryFormProps) {
  const [name, setName] = useState(existingEntry?.name || "");
  const [email, setEmail] = useState(existingEntry?.email || "");
  const [numTickets, setNumTickets] = useState(existingEntry?.num_tickets || 1);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form fields when existingEntry changes
  useEffect(() => {
    if (existingEntry) {
      setName(existingEntry.name);
      setEmail(existingEntry.email);
      setNumTickets(existingEntry.num_tickets);
    }
  }, [existingEntry]);

  useEffect(() => {
    if (existingEntry) {
      const isChanged = 
        name !== existingEntry.name ||
        numTickets !== existingEntry.num_tickets;
      setHasChanges(isChanged);
    } else {
      setHasChanges(true); // Always enabled for new entries
    }
  }, [name, numTickets, existingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      email, 
      num_tickets: numTickets
    });
  };

  const handleLocalEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    handleEmailChange(e);
  };

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
          onChange={handleLocalEmailChange}
          required
          placeholder="Your email"
          className="w-full"
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
          min="0"
          max="10"
          value={numTickets}
          onChange={(e) => setNumTickets(parseInt(e.target.value, 10))}
          required
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || (existingEntry && !hasChanges)}
        variant={existingEntry && numTickets === 0 ? "destructive" : "default"}
        className="w-full hover:bg-wine-light text-white"
      >
        {isSubmitting
          ? "Submitting..."
          : existingEntry && numTickets === 0
          ? "Delete Entry"
          : existingEntry
          ? "Update Entry"
          : "Submit Entry"}
      </Button>
    </form>
  );
}
