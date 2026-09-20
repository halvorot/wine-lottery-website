import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useAuth } from "@/contexts/AuthContext";

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
  const [verifiedIdentity, setVerifiedIdentity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: activeLottery } = useActiveLottery();
  const { isAdmin } = useAuthStatus();
  const { session } = useAuth();
  const verificationIdentity = `${session?.user.id ?? "anonymous"}:${isAdmin ? "admin" : "participant"}:${activeLottery?.id ?? "none"}`;
  const identityRef = useRef(verificationIdentity);
  const requestGenerationRef = useRef(0);
  const isVerified = verifiedIdentity === verificationIdentity;

  const isCurrentRequest = useCallback((generation: number, identity: string) => (
    requestGenerationRef.current === generation && identityRef.current === identity
  ), []);

  const checkExistingVerification = useCallback(async () => {
    const requestIdentity = verificationIdentity;
    const requestGeneration = requestGenerationRef.current;

    if (isAdmin || !activeLottery) {
      if (isCurrentRequest(requestGeneration, requestIdentity)) {
        setVerifiedIdentity(requestIdentity);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("has_lottery_password_verification", {
        target_lottery_id: activeLottery.id,
      });

      if (error) throw error;
      if (isCurrentRequest(requestGeneration, requestIdentity)) {
        setVerifiedIdentity(data === true ? requestIdentity : null);
      }
    } catch (error) {
      console.error("Error checking password verification:", error);
      if (isCurrentRequest(requestGeneration, requestIdentity)) {
        setVerifiedIdentity(null);
      }
    } finally {
      if (isCurrentRequest(requestGeneration, requestIdentity)) {
        setIsLoading(false);
      }
    }
  }, [activeLottery, isAdmin, isCurrentRequest, verificationIdentity]);

  const verifyPassword = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      const requestIdentity = verificationIdentity;
      const requestGeneration = requestGenerationRef.current;

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

        if (!isCurrentRequest(requestGeneration, requestIdentity)) {
          return { success: false, error: "Lottery or account changed. Please try again." };
        }

        setVerifiedIdentity(requestIdentity);
        return { success: true };
      } catch (error) {
        console.error("Error verifying lottery password:", error);
        return { success: false, error: "Unable to verify the password. Please try again." };
      }
    },
    [activeLottery, isCurrentRequest, verificationIdentity],
  );

  const resetVerification = useCallback(() => {
    requestGenerationRef.current += 1;
    setVerifiedIdentity(null);
  }, []);

  useEffect(() => {
    identityRef.current = verificationIdentity;
    requestGenerationRef.current += 1;
    queueMicrotask(() => {
      setVerifiedIdentity(null);
      setIsLoading(true);
      void checkExistingVerification();
    });
  }, [checkExistingVerification, verificationIdentity]);

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
