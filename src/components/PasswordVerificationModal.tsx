import { useState, useEffect } from "react";
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

// Simple rate limiting - store attempts in session storage
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 60000; // 1 minute in milliseconds

export function PasswordVerificationModal({
  isOpen,
  onVerified,
  onClose,
}: PasswordVerificationModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [isLocked, setIsLocked] = useState(false);
  const [lockExpiry, setLockExpiry] = useState<number | null>(null);
  const { toast } = useToast();
  const { data: activeLottery } = useActiveLottery();

  // Check for existing rate limit on mount
  useEffect(() => {
    if (!isOpen) return;
    
    const storedLockExpiry = sessionStorage.getItem('passwordLockExpiry');
    const storedAttempts = sessionStorage.getItem('passwordAttempts');
    
    if (storedLockExpiry) {
      const expiryTime = parseInt(storedLockExpiry, 10);
      if (expiryTime > Date.now()) {
        // Still locked
        setIsLocked(true);
        setLockExpiry(expiryTime);
        const remainingTime = Math.ceil((expiryTime - Date.now()) / 1000);
        setError(`Too many failed attempts. Please try again in ${remainingTime} seconds.`);
      } else {
        // Lock expired, reset
        sessionStorage.removeItem('passwordLockExpiry');
        sessionStorage.setItem('passwordAttempts', MAX_ATTEMPTS.toString());
        setAttemptsLeft(MAX_ATTEMPTS);
        setIsLocked(false);
      }
    }
    
    if (storedAttempts && !isLocked) {
      setAttemptsLeft(parseInt(storedAttempts, 10));
    }
  }, [isOpen]);

  // Update countdown timer if locked
  useEffect(() => {
    if (!isLocked || !lockExpiry) return;
    
    const interval = setInterval(() => {
      const remainingTime = Math.ceil((lockExpiry - Date.now()) / 1000);
      
      if (remainingTime <= 0) {
        // Lock expired
        setIsLocked(false);
        sessionStorage.removeItem('passwordLockExpiry');
        sessionStorage.setItem('passwordAttempts', MAX_ATTEMPTS.toString());
        setAttemptsLeft(MAX_ATTEMPTS);
        setError(null);
        clearInterval(interval);
      } else {
        setError(`Too many failed attempts. Please try again in ${remainingTime} seconds.`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLocked, lockExpiry]);

  const decrementAttempts = () => {
    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);
    sessionStorage.setItem('passwordAttempts', newAttempts.toString());
    
    if (newAttempts <= 0) {
      const expiryTime = Date.now() + LOCKOUT_TIME;
      setIsLocked(true);
      setLockExpiry(expiryTime);
      sessionStorage.setItem('passwordLockExpiry', expiryTime.toString());
      setError(`Too many failed attempts. Please try again in 60 seconds.`);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if locked
    if (isLocked) {
      return;
    }
    
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
        // Reset attempts on successful login
        sessionStorage.setItem('passwordAttempts', MAX_ATTEMPTS.toString());
        
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
        // Decrement attempts on failed login
        decrementAttempts();
        
        toast({
          title: "Error",
          description: `Incorrect password. ${attemptsLeft > 0 ? `${attemptsLeft} attempts left.` : ''}`,
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
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          // Prevent closing on outside click during loading
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on escape key during loading
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
            disabled={isLoading || isLocked}
          />
          <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
            {isLoading ? "Verifying..." : "Verify Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
