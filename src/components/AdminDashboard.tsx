
import { useToast } from "./ui/use-toast";
import { AdminAuthWrapper } from "./admin/AdminAuthWrapper";
import { AdminContent } from "./admin/AdminContent";
import { useAuth } from "@/contexts/AuthContext";

export const AdminDashboard = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
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
