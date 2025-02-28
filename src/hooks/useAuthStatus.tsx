
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthStatus = () => {
  const { session, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        // Check if user is admin
        const { data, error } = await supabase.rpc("check_is_admin");
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (!isLoading) {
      checkAdminStatus();
    }
  }, [session, isLoading]);

  return {
    isAuthenticated: !!session,
    isAdmin,
    isLoading: isLoading || isCheckingAdmin,
    userId: session?.user?.id,
  };
};
