import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useToast } from "@/components/ui/use-toast";

interface PasswordVerificationContextType {
  isVerified: boolean;
  checkVerification: () => Promise<void>;
  setVerified: (value: boolean) => void;
  isCheckingVerification: boolean;
}

const PasswordVerificationContext = createContext<PasswordVerificationContextType>({
  isVerified: false,
  checkVerification: async () => {},
  setVerified: () => {},
  isCheckingVerification: false,
});

export function PasswordVerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const { data: activeLottery } = useActiveLottery();
  const { isAdmin } = useAuthStatus();
  const { toast } = useToast();

  const checkVerification = async () => {
    try {
      setIsCheckingVerification(true);
      
      // If user is admin, they're automatically verified
      if (isAdmin) {
        setIsVerified(true);
        return;
      }

      // Check URL parameters for logout state
      const params = new URLSearchParams(window.location.search);
      const fromLogout = params.get('fromLogout') === 'true';
      
      if (fromLogout) {
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
      setIsVerified(!!data);
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
  };

  // Check verification when active lottery or admin status changes
  useEffect(() => {
    checkVerification();
  }, [activeLottery?.id, isAdmin]);

  return (
    <PasswordVerificationContext.Provider
      value={{ 
        isVerified, 
        checkVerification, 
        setVerified: setIsVerified,
        isCheckingVerification
      }}
    >
      {children}
    </PasswordVerificationContext.Provider>
  );
}

export const usePasswordVerification = () => useContext(PasswordVerificationContext);
