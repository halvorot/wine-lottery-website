
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
  const toggleLockMutation = useToggleLottery();
  const { toast } = useToast();

  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | "all">(
    new Date().toISOString().split("T")[0]
  );
  const entriesPerPage = 10;

  const { prizes, isPrizesLoading, totalPrizes } = useAdminPrizes(
    sortColumn,
    sortDirection,
    page,
    entriesPerPage,
    selectedDate
  );

  const { 
    todayEntries: entries, 
    totalCount: totalEntries,
    sortColumn: entriesSortColumn,
    sortDirection: entriesSortDirection,
    page: entriesPage,
    setPage: setEntriesPage,
    handleSort: handleEntriesSort,
    selectedDate: entriesSelectedDate,
    setSelectedDate: setEntriesSelectedDate,
  } = useLotteryEntries();

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
      // Clear local storage
      localStorage.clear();
      
      // Sign out
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
        entriesCount={totalEntries || 0}
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
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <EntriesSection entries={entries || []} />
    </div>
  );
};
