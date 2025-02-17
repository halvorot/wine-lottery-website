
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AccessDeniedProps {
  onLogout: () => Promise<void>;
}

export const AccessDenied = ({ onLogout }: AccessDeniedProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate("/");
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-4">You need admin privileges to access this section.</p>
      <div className="space-x-4">
        <Button variant="outline" onClick={handleReturnHome}>
          Return to Home
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};
