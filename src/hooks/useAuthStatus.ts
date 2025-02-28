
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        if (session) {
          const { data: adminStatus, error } = await supabase.rpc('check_is_admin_no_recursion');
          if (!error) {
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear the state immediately on sign out
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }
      
      setIsAuthenticated(!!session);
      
      if (session) {
        try {
          const { data: adminStatus, error } = await supabase.rpc('check_is_admin_no_recursion');
          if (!error) {
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, isAdmin, isLoading };
}
