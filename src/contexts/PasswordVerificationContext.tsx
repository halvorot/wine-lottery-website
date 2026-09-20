import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";

interface PasswordVerificationContextType {
  isVerified: boolean;
  isLoading: boolean;
  verifyPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  checkExistingVerification: () => Promise<void>;
  resetVerification: () => void;
}

const PasswordVerificationContext = createContext<PasswordVerificationContextType>({
  isVerified: false,
  isLoading: false,
  verifyPassword: async () => ({ success: false }),
  checkExistingVerification: async () => {},
  resetVerification: () => {},
});

export function PasswordVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: activeLottery } = useActiveLottery();
  const { isAdmin } = useAuthStatus();

  const checkExistingVerification = useCallback(async () => {
    if (isAdmin || !activeLottery) {
      setIsVerified(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("has_lottery_password_verification", {
        target_lottery_id: activeLottery.id,
      });

      if (error) throw error;
      setIsVerified(data === true);
    } catch (error) {
      console.error("Error checking password verification:", error);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeLottery, isAdmin]);

  const verifyPassword = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      if (!activeLottery) {
        return { success: false, error: "No active lottery found" };
      }

      if (!password.trim()) {
        return { success: false, error: "Please enter a password" };
      }

      try {
        const { data, error } = await supabase.rpc("verify_lottery_password", {
          target_lottery_id: activeLottery.id,
          submitted_password: password,
        });

        if (error) throw error;
        if (data !== true) return { success: false, error: "Incorrect password" };

        setIsVerified(true);
        return { success: true };
      } catch (error) {
        console.error("Error verifying lottery password:", error);
        return { success: false, error: "Unable to verify the password. Please try again." };
      }
    },
    [activeLottery],
  );

  const resetVerification = useCallback(() => {
    setIsVerified(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void checkExistingVerification();
    });
  }, [checkExistingVerification]);

  return (
    <PasswordVerificationContext.Provider
      value={{
        isVerified,
        isLoading,
        verifyPassword,
        checkExistingVerification,
        resetVerification,
      }}
    >
      {children}
    </PasswordVerificationContext.Provider>
  );
}

export const usePasswordVerification = () => useContext(PasswordVerificationContext);
