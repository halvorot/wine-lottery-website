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
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { hashPassword } from "@/utils/crypto";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onClose?: () => void;
}

export function PasswordVerificationModal({
  isOpen,
  onVerified,
  onClose,
}: PasswordVerificationModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: activeLottery } = useActiveLottery();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!activeLottery) {
        toast({
          title: "Error",
          description: "No active lottery found",
          variant: "destructive",
        });
        return;
      }

      if (!password.trim()) {
        toast({
          title: "Error",
          description: "Please enter a password",
          variant: "destructive",
        });
        return;
      }

      const hashedPassword = await hashPassword(password);

      // Get the lottery password
      const { data: passwordData, error: passwordError } = await supabase
        .from("lottery_passwords")
        .select("password")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();

      if (passwordError) throw passwordError;

      if (!passwordData?.password) {
        setError("No password set for this lottery. Please contact the administrator.");
        return;
      }

      const isValidPassword = hashedPassword === passwordData?.password;

      if (isValidPassword) {
        // Get user's IP address
        const response = await fetch('https://api.ipify.org?format=json');
        const { ip } = await response.json();

        // Check if already verified for this lottery and IP
        const { data: existingVerification } = await supabase
          .from("password_verifications")
          .select("*")
          .eq("lottery_id", activeLottery.id)
          .eq("user_ip", ip)
          .maybeSingle();

        if (existingVerification) {
          toast({
            title: "Success",
            description: "Already verified for this lottery!",
          });
          onVerified();
          return;
        }

        // Not verified for this lottery and IP, create new verification
        const { error } = await supabase
          .from("password_verifications")
          .insert([{ 
            lottery_id: activeLottery.id,
            user_ip: ip
          }]);

        if (error) {
          throw error;
        }

        // Success toast for successful verification
        toast({
          title: "Success",
          description: "Password verified successfully!",
        });
        onVerified();
      } else {
        toast({
          title: "Error",
          description: "Incorrect password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      // Show critical errors as toasts
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
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
    >
      <DialogContent className="sm:max-w-md">
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
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
