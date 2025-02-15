
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      email, 
      num_tickets: numTickets // Changed from numTickets to num_tickets to match the type
    });
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
          disabled={isSubmitting}
          className="flex-1 bg-wine hover:bg-wine-light text-white"
        >
          {isSubmitting
            ? "Submitting..."
            : existingEntry
            ? "Update Entry"
            : "Submit Entry"}
        </Button>
        
        {existingEntry && (
          <Button
            type="button"
            onClick={onNewEntry}
            variant="outline"
            className="flex-1"
          >
            Add New Entry
          </Button>
        )}
      </div>
    </form>
  );
}
