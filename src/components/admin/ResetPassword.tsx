
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Process auth parameters when the component loads
  useEffect(() => {
    const handleHashFragment = async () => {
      try {
        console.log("Current URL:", window.location.href);
        console.log("Hash:", window.location.hash);
        
        // The hash will contain access_token, type=recovery, etc.
        if (window.location.hash && window.location.hash.includes('type=recovery')) {
          console.log("Auth recovery hash detected, processing token...");
          
          // This function will automatically extract the token from the URL hash
          // and set up the session accordingly
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Session error during hash handling:", error);
            setAuthError("Invalid or expired reset link. Please request a new one.");
            setIsProcessing(false);
            toast({
              title: "Invalid Reset Link",
              description: "There was a problem with your reset link. Please request a new one.",
              variant: "destructive",
            });
            return;
          }
          
          if (data && data.session) {
            console.log("Auth session established for password reset");
            setIsProcessing(false);
          } else {
            console.error("No session found after hash handling");
            setAuthError("Session not found. Please try again with a new reset link.");
            setIsProcessing(false);
            toast({
              title: "Authentication Failed",
              description: "Could not authenticate with the provided link. Please request a new one.",
              variant: "destructive",
            });
          }
        } else {
          console.log("No auth hash fragment detected.");
          setAuthError("Invalid reset link format. Please request a new one.");
          setIsProcessing(false);
          toast({
            title: "Invalid Reset Link",
            description: "The reset link appears to be invalid. Please request a new one.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error processing auth parameters:", err);
        setAuthError("An unexpected error occurred. Please try again.");
        setIsProcessing(false);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleHashFragment();
  }, [toast]);

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
      // This will update the password for the user that is currently in the session
      // which was established when we processed the hash above
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

  if (authError) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg mt-16 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h2>
        <p className="mb-6">{authError}</p>
        <Button onClick={() => navigate("/")} className="w-full">
          Return to Home
        </Button>
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
