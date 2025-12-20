import { ReactNode, useState, useEffect } from "react";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { PasswordVerificationModal } from "./PasswordVerificationModal";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface PasswordProtectedRouteProps {
  children: ReactNode;
}

export function PasswordProtectedRoute({ children }: PasswordProtectedRouteProps) {
  const { isVerified, isLoading } = usePasswordVerification();
  const { isAdmin } = useAuthStatus();
  const { data: activeLottery } = useActiveLottery();
  const [showModal, setShowModal] = useState(false);

  // Show modal when not verified
  useEffect(() => {
    // Don't show modal while loading
    if (isLoading) {
      setShowModal(false);
      return;
    }

    // Admin users don't need password
    if (isAdmin) {
      setShowModal(false);
      return;
    }

    // No active lottery = no password needed
    if (!activeLottery) {
      setShowModal(false);
      return;
    }

    // Show modal if not verified
    setShowModal(!isVerified);
  }, [isVerified, isLoading, isAdmin, activeLottery]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[200px]">
        <Spinner size="md" />
      </div>
    );
  }

  // Admin users can access without password
  if (isAdmin) {
    return <>{children}</>;
  }

  // No active lottery = no password needed
  if (!activeLottery) {
    return <>{children}</>;
  }

  // If verified, show content
  if (isVerified) {
    return <>{children}</>;
  }

  // Not verified - show password required message and modal
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
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
