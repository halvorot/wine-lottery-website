
import { AdminLogin } from "./AdminLogin";
import { AccessDenied } from "./AccessDenied";
import { useAuthStatus } from "@/hooks/useAuthStatus";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
  onLogout: () => Promise<void>;
}

export const AdminAuthWrapper = ({ children, onLogout }: AdminAuthWrapperProps) => {
  const { isAuthenticated, isAdmin } = useAuthStatus();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <AccessDenied onLogout={onLogout} />;
  }

  return <>{children}</>;
};
