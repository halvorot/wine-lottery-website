
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthStatus() {
  const { session } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!session);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // This function checks if a user is an admin
    const checkAdminStatus = async (userId: string | undefined) => {
      if (!userId) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data: adminStatus, error } = await supabase.rpc('check_is_admin_no_recursion');
        
        if (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!adminStatus);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    // Update authentication state based on session
    if (session) {
      setIsAuthenticated(true);
      checkAdminStatus(session.user.id);
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
    
    // Always set loading to false when authentication state is determined
    setIsLoading(false);
  }, [session]);

  return { isAuthenticated, isAdmin, isLoading };
}
