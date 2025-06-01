import { ReactNode, useEffect, useState } from "react";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { PasswordVerificationModal } from "./PasswordVerificationModal";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface PasswordProtectedRouteProps {
  children: ReactNode;
}

export function PasswordProtectedRoute({ children }: PasswordProtectedRouteProps) {
  const { isVerified, checkVerification, isCheckingVerification, resetVerification } = usePasswordVerification();
  const { isAdmin, isLoading: isAuthLoading } = useAuthStatus();
  const { data: activeLottery, isLoading: isLotteryLoading } = useActiveLottery();
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const [previousVerificationState, setPreviousVerificationState] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [previousAdminState, setPreviousAdminState] = useState(isAdmin);
  
  // Determine if we're in a loading state
  const isLoading = isCheckingVerification || isAuthLoading || isLotteryLoading || !initialCheckComplete;

  // Track verification state changes to show success toast only when newly verified
  useEffect(() => {
    // Update previous verification state
    setPreviousVerificationState(isVerified);
  }, [isVerified, activeLottery, isAdmin, toast]);

  // Track admin state changes to detect logout
  useEffect(() => {
    // If admin status changed from true to false (logout)
    if (previousAdminState && !isAdmin) {
      // Force verification reset on admin logout
      resetVerification();
      // Force a new verification check
      checkVerification();
    }
    
    setPreviousAdminState(isAdmin);
  }, [isAdmin, previousAdminState, resetVerification, checkVerification]);

  // Only update the modal visibility after the initial verification check is complete
  useEffect(() => {
    if (isCheckingVerification) {
      return; // Don't update modal state while checking
    }

    // Mark initial check as complete
    if (!initialCheckComplete) {
      setInitialCheckComplete(true);
    }

    // If user is admin, they don't need password verification
    if (isAdmin) {
      setShowModal(false);
      return;
    }
    
    // If there's no active lottery, no need for verification
    if (!activeLottery && !isLotteryLoading) {
      setShowModal(false);
      return;
    }
    
    // Only show modal if we're sure verification is needed
    if (!isVerified && activeLottery && !isLotteryLoading && initialCheckComplete) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isVerified, isAdmin, activeLottery, isLotteryLoading, isCheckingVerification, initialCheckComplete]);

  const handleVerified = async () => {
    await checkVerification();
    setShowModal(false);
  };

  // Show loading state while any verification or auth check is in progress
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[200px]">
        <Spinner size="md" />
      </div>
    );
  }

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
      </div>
      
      <PasswordVerificationModal
        isOpen={showModal}
        onVerified={handleVerified}
        onClose={() => setShowModal(false)}
      />
    </>
  );
} 