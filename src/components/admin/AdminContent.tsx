
import { AdminHeader } from "./AdminHeader";
import { AdminStats } from "./AdminStats";
import { PrizesSection } from "./PrizesSection";
import { EntriesSection } from "./EntriesSection";
import { useLotteryStatus } from "@/hooks/useLotteryStatus";
import { useAdminPrizes } from "@/hooks/useAdminPrizes";
import { useLotteryEntries } from "@/hooks/useLotteryEntries";
import { useToggleLottery } from "@/hooks/useToggleLottery";
import { useAdminState } from "@/hooks/useAdminState";

interface AdminContentProps {
  onLogout: () => Promise<void>;
}

export const AdminContent = ({ onLogout }: AdminContentProps) => {
  const lotteryStatus = useLotteryStatus();
  const toggleLockMutation = useToggleLottery();
  const entriesPerPage = 10;

  const {
    sortColumn,
    sortDirection,
    page,
    selectedDate,
    setPage,
    setSelectedDate,
    handleSort,
  } = useAdminState();

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
  } = useLotteryEntries();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
      <AdminHeader
        isLocked={lotteryStatus?.is_locked || false}
        isLoading={!lotteryStatus}
        isPending={toggleLockMutation.isPending}
        onToggleLock={() => toggleLockMutation.mutate()}
        onLogout={onLogout}
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
