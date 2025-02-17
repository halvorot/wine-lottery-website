
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";

interface PasswordVerificationContextType {
  isVerified: boolean;
  checkVerification: () => Promise<void>;
  setVerified: (value: boolean) => void;
}

const PasswordVerificationContext = createContext<PasswordVerificationContextType>({
  isVerified: false,
  checkVerification: async () => {},
  setVerified: () => {},
});

export function PasswordVerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const { data: activeLottery } = useActiveLottery();

  const checkVerification = async () => {
    try {
      // Check URL parameters for logout state
      const params = new URLSearchParams(window.location.search);
      const fromLogout = params.get('fromLogout') === 'true';
      
      if (fromLogout) {
        setIsVerified(true);
        return;
      }

      if (!activeLottery) {
        setIsVerified(false);
        return;
      }

      const { data, error } = await supabase
        .from("password_verifications")
        .select("*")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();

      if (error) throw error;
      setIsVerified(!!data);
    } catch (error) {
      console.error("Error checking verification:", error);
      setIsVerified(false);
    }
  };

  useEffect(() => {
    checkVerification();
  }, [activeLottery?.id]);

  return (
    <PasswordVerificationContext.Provider
      value={{ isVerified, checkVerification, setVerified: setIsVerified }}
    >
      {children}
    </PasswordVerificationContext.Provider>
  );
}

export const usePasswordVerification = () => useContext(PasswordVerificationContext);
