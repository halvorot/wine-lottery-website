
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        const { data: adminStatus, error } = await supabase.rpc('check_is_admin');
        if (!error) {
          setIsAdmin(adminStatus);
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      if (session) {
        const { data: adminStatus, error } = await supabase.rpc('check_is_admin');
        if (!error) {
          setIsAdmin(adminStatus);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, isAdmin };
}
