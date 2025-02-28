
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Save the subscription to clean up later
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } };
    
    const checkAuth = async () => {
      try {
        console.log("Checking auth session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log("Session found:", !!session);
        setIsAuthenticated(!!session);

        if (session) {
          console.log("Checking admin status...");
          const { data: adminStatus, error } = await supabase.rpc('check_is_admin_no_recursion');
          
          if (error) {
            console.error("Admin check error:", error);
            setIsAdmin(false);
          } else {
            console.log("Admin status:", adminStatus);
            setIsAdmin(!!adminStatus);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        console.log("Auth check complete, setting isLoading to false");
        setIsLoading(false);
      }
    };
    
    // Check auth immediately
    checkAuth();

    // Set up subscription to auth changes
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        // Clear the state immediately on sign out
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("User signed in or token refreshed");
        setIsAuthenticated(!!session);
        
        if (session) {
          try {
            const { data: adminStatus, error } = await supabase.rpc('check_is_admin_no_recursion');
            if (error) {
              console.error("Admin check error:", error);
              setIsAdmin(false);
            } else {
              console.log("Admin status:", adminStatus);
              setIsAdmin(!!adminStatus);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    });

    return () => {
      // Clean up subscription on component unmount
      if (authSubscription && authSubscription.data) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  return { isAuthenticated, isAdmin, isLoading };
}
