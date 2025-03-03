
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);

  // Process auth parameters when the component loads
  useEffect(() => {
    const processAuthParams = async () => {
      try {
        console.log("Current URL:", window.location.href);
        console.log("Hash:", location.hash);
        console.log("Search params:", Object.fromEntries(searchParams.entries()));
        
        // Look for auth parameters in both hash and query params
        if (location.hash && location.hash.includes('type=recovery')) {
          console.log("Auth recovery hash detected");
          
          // This exchanges the recovery token in the URL for a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Session error:", error);
            toast({
              title: "Invalid Reset Link",
              description: "There was a problem with your reset link. Please request a new one.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
          
          if (data.session) {
            console.log("Session successfully recovered for password reset");
            setIsProcessing(false);
          } else {
            console.error("No session found after hash handling");
            toast({
              title: "Session Expired",
              description: "Your password reset session has expired. Please try again.",
              variant: "destructive",
            });
            navigate("/");
          }
        } 
        // Check for token in query parameters (some Supabase configurations use this)
        else if (searchParams.get('token_hash') || searchParams.get('type')) {
          console.log("Auth parameters detected in query string");
          
          const token = searchParams.get('token_hash');
          const type = searchParams.get('type');
          
          if (type === 'recovery' && token) {
            // Some Supabase configurations might use URL params instead of hash
            try {
              // This will set the token from params
              const { error } = await supabase.auth.refreshSession({ refresh_token: token });
              
              if (error) {
                console.error("Token refresh error:", error);
                toast({
                  title: "Invalid Reset Link",
                  description: "Your password reset link is invalid or has expired. Please request a new one.",
                  variant: "destructive",
                });
                navigate("/");
              } else {
                console.log("Token successfully processed");
                setIsProcessing(false);
              }
            } catch (err) {
              console.error("Token processing error:", err);
              toast({
                title: "Error",
                description: "An unexpected error occurred. Please try requesting a new password reset.",
                variant: "destructive",
              });
              navigate("/");
            }
          } else {
            // No valid token found in params
            checkSession();
          }
        } else {
          // No auth parameters found, check if user has active session
          checkSession();
        }
      } catch (err) {
        console.error("Auth parameter processing error:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    processAuthParams();
  }, [location, navigate, searchParams, toast]);

  // Verify that we have a session
  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("Active session found for password reset");
        setIsProcessing(false);
      } else {
        console.log("No active session found for password reset");
        toast({
          title: "Session Expired",
          description: "Your password reset session has expired. Please request a new link.",
          variant: "destructive",
        });
        navigate("/");
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

  if (isProcessing) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg mt-16 text-center">
        <p className="mb-4">Verifying your reset link...</p>
        <div className="h-8 w-8 border-4 border-t-wine/50 border-wine rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

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
