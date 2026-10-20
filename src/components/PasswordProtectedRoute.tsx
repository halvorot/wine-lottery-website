import { ReactNode, useState } from "react";
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
  const [modalState, setModalState] = useState({ lotteryId: null as string | null, open: true });
  const lotteryId = activeLottery?.id ?? null;
  const showModal = modalState.lotteryId === lotteryId ? modalState.open : true;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 min-h-[200px]">
        <Spinner size="md" />
      </div>
    );
  }

  if (isAdmin || !activeLottery || isVerified) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="text-center p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2 text-yellow-800">Password Required</h3>
        <p className="text-yellow-700 mb-4">Please enter the password to access this lottery.</p>
        <Button
          onClick={() => setModalState({ lotteryId, open: true })}
          variant="default"
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Enter Password
        </Button>
      </div>

      <PasswordVerificationModal
        isOpen={showModal}
        onClose={() => setModalState({ lotteryId, open: false })}
      />
    </>
  );
}
