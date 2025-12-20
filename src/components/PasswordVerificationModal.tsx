import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function PasswordVerificationModal({
  isOpen,
  onClose,
}: PasswordVerificationModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: activeLottery } = useActiveLottery();
  const { verifyPassword } = usePasswordVerification();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleVerify called");
    console.log("verifyPassword function exists:", typeof verifyPassword);
    console.log("password:", password);

    setIsLoading(true);
    setError(null);

    try {
      console.log("Calling verifyPassword...");
      const result = await verifyPassword(password);
      console.log("verifyPassword returned:", result);

      if (result.success) {
        console.log("Success!");
        toast({
          title: "Success",
          description: "Password verified successfully!",
        });
        setPassword("");
        // Modal will close automatically when isVerified updates in context
      } else {
        console.log("Verification failed:", result.error);
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error caught:", err);
      setError("Failed to verify password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format the draw date and time for display
  const formatDateTime = () => {
    if (!activeLottery || !activeLottery.draw_date) return "";

    try {
      const drawDateTime = new Date(`${activeLottery.draw_date}T${activeLottery.draw_time || '00:00:00'}`);
      return drawDateTime.toLocaleString('no-NB', {
        dateStyle: 'long',
        timeStyle: 'short',
        hour12: false
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Active Lottery";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Lottery Password Required</DialogTitle>
          <DialogDescription>
            Please enter the password for this lottery to participate.
            {activeLottery && (
              <span className="block mt-2 font-medium text-wine">
                Lottery: {formatDateTime()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input
            type="password"
            placeholder="Enter lottery password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
