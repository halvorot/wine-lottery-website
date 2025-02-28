import { ReactNode, useEffect, useState } from "react";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { PasswordVerificationModal } from "./PasswordVerificationModal";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";

interface PasswordProtectedRouteProps {
  children: ReactNode;
}

export function PasswordProtectedRoute({ children }: PasswordProtectedRouteProps) {
  const { isVerified, checkVerification, isCheckingVerification } = usePasswordVerification();
  const { isAdmin } = useAuthStatus();
  const { data: activeLottery, isLoading: isLotteryLoading } = useActiveLottery();
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const [previousVerificationState, setPreviousVerificationState] = useState(false);

  // Track verification state changes to show success toast only when newly verified
  useEffect(() => {
    // If verification state changes from false to true, show success toast
    // Only show this for non-admin users who have just been verified
    if (!previousVerificationState && isVerified && activeLottery && !isAdmin) {
      toast({
        title: "Access Granted",
        description: `You now have access to the active lottery!`,
      });
    }
    
    // Update previous verification state
    setPreviousVerificationState(isVerified);
  }, [isVerified, activeLottery, isAdmin, toast]);

  useEffect(() => {
    // If user is admin, they don't need password verification
    if (isAdmin) return;
    
    // If there's no active lottery, no need for verification
    if (!activeLottery && !isLotteryLoading) return;
    
    // If not verified and there is an active lottery, show the modal
    if (!isVerified && activeLottery && !isLotteryLoading && !isCheckingVerification) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isVerified, isAdmin, activeLottery, isLotteryLoading, isCheckingVerification]);

  const handleVerified = async () => {
    await checkVerification();
    setShowModal(false);
  };

  // If user is admin, render children without verification
  if (isAdmin) {
    return <>{children}</>;
  }

  // If there's no active lottery, render children without verification
  if (!activeLottery && !isLotteryLoading) {
    return <>{children}</>;
  }

  // If verified, render children
  if (isVerified) {
    return <>{children}</>;
  }

  // If not verified, show a placeholder message instead of the actual content
  return (
    <>
      <div className="text-center p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2 text-yellow-800">
          Password Required
        </h3>
        <p className="text-yellow-700 mb-4">
          Please enter the password to access this lottery.
        </p>
        <Button 
          onClick={() => setShowModal(true)} 
          variant="default" 
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Enter Password
        </Button>
        <p className="text-sm text-yellow-600 mt-4">
          You can navigate to the Admin tab without entering a password.
        </p>
      </div>
      
      <PasswordVerificationModal
        isOpen={showModal}
        onVerified={handleVerified}
        onClose={() => setShowModal(false)}
      />
    </>
  );
} 