
import { EntryForm } from "./lottery/EntryForm";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useEntryManagement } from "@/hooks/useEntryManagement";
import { useLotteryStatus } from "@/hooks/useLotteryStatus";

export function LotteryEntryForm() {
  const isAuthenticated = useAuthStatus();
  const lotteryStatus = useLotteryStatus();
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

  return (
    <div className="space-y-8">
      {!lotteryStatus?.is_locked && (
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

      {lotteryStatus?.is_locked && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            Today's lottery entries are currently locked. No new entries can be submitted.
          </p>
        </div>
      )}
    </div>
  );
}
