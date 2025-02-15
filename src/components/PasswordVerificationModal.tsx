
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

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
}

export function PasswordVerificationModal({
  isOpen,
  onVerified,
}: PasswordVerificationModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes, hardcode the daily password
      // In a real app, this would be fetched from a secure backend
      const DAILY_PASSWORD = "wine2024";

      if (password === DAILY_PASSWORD) {
        // Check if already verified today
        const today = new Date().toISOString().split("T")[0];
        const { data: existingVerification } = await supabase
          .from("password_verifications")
          .select("*")
          .eq("verified_date", today)
          .maybeSingle();

        if (existingVerification) {
          // Already verified today
          toast({
            title: "Success",
            description: "Already verified for today!",
          });
          onVerified();
          return;
        }

        // Not verified today, create new verification
        const { error } = await supabase
          .from("password_verifications")
          .insert([{ user_ip: "127.0.0.1" }]);

        if (error) {
          throw error;
        }

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
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily Password Required</DialogTitle>
          <DialogDescription>
            Please enter today's password to access the wine lottery.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter daily password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
