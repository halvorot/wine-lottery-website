
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Check if we have a hash in the URL (Supabase auth redirect)
  useEffect(() => {
    const handleHashChange = async () => {
      // Get the URL fragment (hash)
      const hash = location.hash;
      
      if (hash && hash.includes('type=recovery')) {
        // Parse the hash - Supabase adds auth parameters to the URL hash
        console.log("Auth recovery hash detected:", hash);
        
        try {
          // This will set the Supabase auth session based on the URL parameters
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Session error:", error);
            toast({
              title: "Session Error",
              description: "There was a problem with your reset link. Please try again.",
              variant: "destructive",
            });
            navigate("/");
          } else if (!data.session) {
            console.error("No session found after hash handling");
            toast({
              title: "Session Expired",
              description: "Your password reset session could not be recovered. Please try again.",
              variant: "destructive",
            });
            navigate("/");
          } else {
            console.log("Session successfully recovered for password reset");
          }
        } catch (err) {
          console.error("Hash handling error:", err);
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try requesting a new password reset.",
            variant: "destructive",
          });
          navigate("/");
        }
      } else {
        // Regular session check if no hash is present
        checkSession();
      }
    };

    handleHashChange();
  }, [location, navigate, toast]);

  // Verify that we have a session
  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      // If no session exists, redirect to login
      if (!data.session) {
        console.log("No active session found for password reset");
        toast({
          title: "Session Expired",
          description: "Your password reset session has expired. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } else {
        console.log("Active session found for password reset");
      }
    } catch (error) {
      console.error("Session check error:", error);
      toast({
        title: "Error",
        description: "Could not verify your session. Please try again.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const validatePasswords = () => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password update error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully reset. You can now log in with your new password.",
        });
        
        // Sign out the user after password reset
        await supabase.auth.signOut();
        
        // Redirect to home/login
        navigate("/");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg mt-16">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h2>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordError && (
            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};
