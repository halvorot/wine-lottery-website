
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminStats } from "./admin/AdminStats";
import { PrizesSection } from "./admin/PrizesSection";
import { EntriesSection } from "./admin/EntriesSection";
import { AdminLogin } from "./admin/AdminLogin";
import { AccessDenied } from "./admin/AccessDenied";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useLotteryStatus } from "@/hooks/useLotteryStatus";
import { useLotteryEntries } from "@/hooks/useLotteryEntries";
import { useAdminPrizes } from "@/hooks/useAdminPrizes";
import { useToggleLottery } from "@/hooks/useToggleLottery";
import { useToast } from "./ui/use-toast";

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuthStatus();
  const lotteryStatus = useLotteryStatus();
  const { todayEntries: entries } = useLotteryEntries();
  const toggleLockMutation = useToggleLottery();
  const { toast } = useToast();

  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const entriesPerPage = 10;

  const { prizes, isPrizesLoading, totalPrizes } = useAdminPrizes(
    sortColumn,
    sortDirection,
    page,
    entriesPerPage
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        // If we get a session_not_found error, we can consider the user logged out
        if (error.message.includes("session_not_found")) {
          window.location.reload(); // Force a refresh to clear any remaining state
          return;
        }
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force a page refresh to clear any lingering state
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <AccessDenied onLogout={handleLogout} />;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
      <AdminHeader
        isLocked={lotteryStatus?.is_locked || false}
        isLoading={!lotteryStatus}
        isPending={toggleLockMutation.isPending}
        onToggleLock={() => toggleLockMutation.mutate()}
        onLogout={handleLogout}
      />

      <AdminStats
        entriesCount={entries?.length || 0}
        prizesCount={totalPrizes || 0}
      />

      <PrizesSection
        prizes={prizes || []}
        isLoading={isPrizesLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        page={page}
        totalCount={totalPrizes || 0}
        entriesPerPage={entriesPerPage}
        onSort={handleSort}
        onPageChange={setPage}
      />

      <EntriesSection entries={entries || []} />
    </div>
  );
};
