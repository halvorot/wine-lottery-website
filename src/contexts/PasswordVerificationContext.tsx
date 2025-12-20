import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useToast } from "@/components/ui/use-toast";

interface PasswordVerificationContextType {
  isVerified: boolean;
  checkVerification: () => Promise<void>;
  setVerified: (value: boolean) => void;
  isCheckingVerification: boolean;
  resetVerification: () => void;
}

const PasswordVerificationContext = createContext<PasswordVerificationContextType>({
  isVerified: false,
  checkVerification: async () => {},
  setVerified: () => {},
  isCheckingVerification: false,
  resetVerification: () => {},
});

// Timeout for verification check in milliseconds (10 seconds)
const VERIFICATION_TIMEOUT = 10000;

export function PasswordVerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [lastCheckedLotteryId, setLastCheckedLotteryId] = useState<string | null>(null);
  const { data: activeLottery } = useActiveLottery();
  const { isAdmin } = useAuthStatus();
  const { toast } = useToast();

  // Function to reset verification state
  const resetVerification = () => {
    setIsVerified(false);
    setLastCheckedLotteryId(null);
  };

  // Listen for logout events via URL parameters
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const fromLogout = params.get('fromLogout') === 'true';
      
      if (fromLogout) {
        // Reset verification state on logout
        resetVerification();
        
        // Remove the fromLogout parameter to avoid issues on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('fromLogout');
        window.history.replaceState({}, '', newUrl.toString());
      }
    };

    // Check on mount
    handleUrlChange();

    // Listen for URL changes
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const checkVerification = useCallback(async () => {
    // If already checking, don't start another check
    if (isCheckingVerification) {
      return;
    }

    setIsCheckingVerification(true);

    // Create a timeout promise
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Verification check timed out"));
      }, VERIFICATION_TIMEOUT);
    });

    try {
      // Race the verification check against the timeout
      await Promise.race([
        (async () => {
          // If user is admin, they're automatically verified
          if (isAdmin) {
            setIsVerified(true);
            return;
          }

          // If there's no active lottery, no verification needed
          if (!activeLottery) {
            setIsVerified(true);
            return;
          }

          // Get user's IP address
          const response = await fetch('https://api.ipify.org?format=json');
          const { ip } = await response.json();

          const { data, error } = await supabase
            .from("password_verifications")
            .select("*")
            .eq("lottery_id", activeLottery.id)
            .eq("user_ip", ip)
            .maybeSingle();

          if (error) throw error;

          // Update verification state and remember which lottery we checked
          setIsVerified(!!data);
          setLastCheckedLotteryId(activeLottery.id);
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error("Error checking verification:", error);
      setIsVerified(false);

      // Only show toast for critical errors that prevent the app from functioning
      toast({
        title: "Verification Error",
        description: "Failed to check verification status. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingVerification(false);
    }
  }, [isCheckingVerification, isAdmin, activeLottery, toast]);

  // Check verification when active lottery or admin status changes
  useEffect(() => {
    // Skip check if no active lottery or if user is admin (they're always verified)
    if (!activeLottery && !isAdmin) {
      setIsVerified(true);
      return;
    }

    // Skip check if we've already verified this lottery
    if (activeLottery && lastCheckedLotteryId === activeLottery.id) {
      return;
    }

    checkVerification();
  }, [activeLottery, checkVerification, lastCheckedLotteryId, isAdmin]);

  // Reset verification when admin status changes from true to false (logout)
  useEffect(() => {
    if (!isAdmin) {
      // This will trigger when admin logs out
      // We need to force a new verification check
      setLastCheckedLotteryId(null);
    }
  }, [isAdmin]);

  return (
    <PasswordVerificationContext.Provider
      value={{ 
        isVerified, 
        checkVerification, 
        setVerified: setIsVerified,
        isCheckingVerification,
        resetVerification
      }}
    >
      {children}
    </PasswordVerificationContext.Provider>
  );
}

export const usePasswordVerification = () => useContext(PasswordVerificationContext);
