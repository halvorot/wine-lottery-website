import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { hashPassword } from "@/utils/crypto";

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

export function PasswordVerificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLotteryId, setCurrentLotteryId] = useState<string | null>(null);
  const { data: activeLottery } = useActiveLottery();
  const { isAdmin } = useAuthStatus();

  // Reset verification when lottery changes
  useEffect(() => {
    if (activeLottery?.id !== currentLotteryId) {
      setIsVerified(false);
      setCurrentLotteryId(activeLottery?.id || null);
    }
  }, [activeLottery?.id, currentLotteryId]);

  // Reset verification when admin logs out
  useEffect(() => {
    if (!isAdmin && currentLotteryId) {
      setIsVerified(false);
    }
  }, [isAdmin, currentLotteryId]);

  // Check existing verification on mount and when lottery changes
  const checkExistingVerification = useCallback(async () => {
    setIsLoading(true);

    try {
      // Admins are always verified
      if (isAdmin) {
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      // No active lottery = no verification needed
      if (!activeLottery) {
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      // Get user IP
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // Check if verification exists
      const { data } = await supabase
        .from("password_verifications")
        .select("*")
        .eq("lottery_id", activeLottery.id)
        .eq("user_ip", ip)
        .maybeSingle();

      setIsVerified(!!data);
    } catch (error) {
      console.error("Error checking verification:", error);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, activeLottery]);

  // Verify password
  const verifyPassword = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
    console.log("verifyPassword called with password length:", password?.length);
    console.log("activeLottery:", activeLottery?.id);

    if (!activeLottery) {
      console.log("No active lottery");
      return { success: false, error: "No active lottery found" };
    }

    if (!password.trim()) {
      console.log("Empty password");
      return { success: false, error: "Please enter a password" };
    }

    try {
      // Hash the password
      console.log("Hashing password...");
      const hashedPassword = await hashPassword(password);
      console.log("Hashed password:", hashedPassword?.substring(0, 20) + "...");

      // Get lottery password
      console.log("Fetching lottery password from DB...");
      const { data: passwordData, error: passwordError } = await supabase
        .from("lottery_passwords")
        .select("password")
        .eq("lottery_id", activeLottery.id)
        .maybeSingle();

      console.log("Password data:", passwordData ? "found" : "not found");
      console.log("Password error:", passwordError);

      if (passwordError) {
        console.error("Database error fetching password:", passwordError);
        throw passwordError;
      }

      if (!passwordData?.password) {
        console.log("No password set for lottery");
        return { success: false, error: "No password set for this lottery" };
      }

      console.log("Stored password:", passwordData.password.substring(0, 20) + "...");
      console.log("Passwords match:", hashedPassword === passwordData.password);

      // Check if password is correct
      if (hashedPassword !== passwordData.password) {
        console.log("Password mismatch");
        return { success: false, error: "Incorrect password" };
      }

      // Password is correct - get user IP and store verification
      console.log("Password correct, getting IP...");
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      console.log("IP:", ip);

      // Store verification
      console.log("Storing verification...");
      const { error: insertError } = await supabase
        .from("password_verifications")
        .insert([{
          lottery_id: activeLottery.id,
          user_ip: ip
        }]);

      console.log("Insert error:", insertError);

      // If error is duplicate key, that's fine - already verified
      if (insertError && !insertError.message.includes('duplicate')) {
        console.error("Insert error (not duplicate):", insertError);
        throw insertError;
      }

      // Success - update state
      console.log("Verification successful!");
      setIsVerified(true);
      return { success: true };
    } catch (error) {
      console.error("Error verifying password (caught):", error);
      return { success: false, error: `Failed to verify password: ${error instanceof Error ? error.message : String(error)}` };
    }
  }, [activeLottery]);

  // Reset verification
  const resetVerification = useCallback(() => {
    setIsVerified(false);
    setCurrentLotteryId(null);
  }, []);

  // Initial check on mount and when lottery/admin changes
  useEffect(() => {
    checkExistingVerification();
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
