
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
  const { data: activeLottery } = useActiveLottery();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!activeLottery) {
        toast({
          title: "Error",
          description: "No active lottery found",
          variant: "destructive",
        });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const ADMIN_HASH = await hashPassword("admin2024"); // Hash the admin password too

      // Get the lottery password
      const { data: passwordData, error: passwordError } = await supabase
        .from("lottery_passwords")
        .select("password")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();

      if (passwordError) throw passwordError;

      const isAdmin = hashedPassword === ADMIN_HASH;
      const isValidPassword = hashedPassword === passwordData?.password || isAdmin;

      if (isValidPassword) {
        // Check if already verified for this lottery
        const { data: existingVerification } = await supabase
          .from("password_verifications")
          .select("*")
          .eq("lottery_id", activeLottery.id)
          .maybeSingle();

        if (existingVerification) {
          toast({
            title: "Success",
            description: "Already verified for this lottery!",
          });
          onVerified();
          return;
        }

        // Not verified for this lottery, create new verification
        const { error } = await supabase
          .from("password_verifications")
          .insert([{ lottery_id: activeLottery.id }]);

        if (error) {
          throw error;
        }

        // If this is an admin login, make sure they are in the admin_users table
        if (isAdmin) {
          const { data: session } = await supabase.auth.getSession();
          if (session?.session?.user?.id) {
            await supabase
              .from("admin_users")
              .upsert([{ user_id: session.session.user.id }]);
          }
        }

        toast({
          title: "Success",
          description: `Password verified successfully! ${
            isAdmin ? "(Admin access granted)" : ""
          }`,
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
          <DialogTitle>Lottery Password Required</DialogTitle>
          <DialogDescription>
            Please enter the password for this lottery to participate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter lottery password"
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
