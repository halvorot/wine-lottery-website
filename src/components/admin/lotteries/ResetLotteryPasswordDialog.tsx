import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hashPassword } from "@/utils/crypto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface ResetLotteryPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lotteryId: string;
}

export function ResetLotteryPasswordDialog({
  isOpen,
  onClose,
  lotteryId,
}: ResetLotteryPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const hashedPassword = await hashPassword(newPassword);

      // Update the password in lottery_passwords table
      const { error } = await supabase
        .from("lottery_passwords")
        .update({ password: hashedPassword })
        .eq("lottery_id", lotteryId);

      if (error) throw error;

      return newPassword;
    },
    onSuccess: (savedPassword) => {
      setCopiedPassword(savedPassword);
      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["lottery_passwords"] });
    },
    onError: (error) => {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate(password);
  };

  const handleCopy = async () => {
    const textToCopy = copiedPassword || password;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setPassword("");
    setCopiedPassword("");
    setShowPassword(false);
    setIsCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Lottery Password</DialogTitle>
          <DialogDescription>
            Enter a new password for this lottery. The password will be hashed before saving.
          </DialogDescription>
        </DialogHeader>

        {!copiedPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-900 mb-2">
                Password updated successfully!
              </p>
              <p className="text-sm text-green-700 mb-3">
                Make sure to copy and save this password - you won't be able to view it again.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={copiedPassword}
                  readOnly
                  className="bg-white font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
