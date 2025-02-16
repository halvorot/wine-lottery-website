
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";

interface AdminHeaderProps {
  isLocked: boolean;
  isLoading: boolean;
  isPending: boolean;
  onToggleLock: () => void;
  onLogout: () => void;
}

export const AdminHeader = ({
  isLocked,
  isLoading,
  isPending,
  onToggleLock,
  onLogout,
}: AdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleLock}
          disabled={isLoading || isPending}
          className={`${
            isLocked
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          } text-white h-10 px-4`}
        >
          {isLocked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" /> Unlock Entries
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" /> Lock Entries
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={onLogout}
          className="h-10 px-4"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
