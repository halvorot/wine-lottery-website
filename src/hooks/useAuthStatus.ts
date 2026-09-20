
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminStatus {
  userId: string | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuthStatus() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const isAuthenticated = Boolean(session);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    userId: null,
    isAdmin: false,
    isLoading: false,
  });
  const requestGenerationRef = useRef(0);

  useEffect(() => {
    const requestGeneration = ++requestGenerationRef.current;
    let isMounted = true;
    const isCurrentRequest = () => (
      isMounted && requestGenerationRef.current === requestGeneration
    );

    const setCurrentStatus = (isAdmin: boolean, isLoading: boolean) => {
      if (isCurrentRequest()) {
        setAdminStatus({ userId, isAdmin, isLoading });
      }
    };

    const checkAdminStatus = async () => {
      try {
        const { data: adminResult, error } = await supabase.rpc("check_is_admin_no_recursion");

        if (error) throw error;
        setCurrentStatus(adminResult === true, false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setCurrentStatus(false, false);
      }
    };

    // The returned status is derived fail-closed until this update runs.
    queueMicrotask(() => {
      setCurrentStatus(false, userId !== null);
      if (userId) void checkAdminStatus();
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // A render for a different user must never reuse an earlier user's admin result.
  const isCurrentUser = adminStatus.userId === userId;

  return {
    isAuthenticated,
    isAdmin: isCurrentUser && adminStatus.isAdmin,
    isLoading: !isCurrentUser || adminStatus.isLoading,
  };
}
