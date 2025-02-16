
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthWrapper } from "./admin/AdminAuthWrapper";
import { AdminContent } from "./admin/AdminContent";

export const AdminDashboard = () => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminAuthWrapper onLogout={handleLogout}>
      <AdminContent onLogout={handleLogout} />
    </AdminAuthWrapper>
  );
};
