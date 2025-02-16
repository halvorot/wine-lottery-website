
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          onClick={onToggleLock}
          disabled={isLoading || isPending}
          className={`${
            isLocked
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          } text-white h-10 px-4 flex-1 sm:flex-none`}
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
          className="h-10 px-4 flex-1 sm:flex-none"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
