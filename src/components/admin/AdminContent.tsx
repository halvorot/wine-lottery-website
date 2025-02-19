
import { AdminHeader } from "./AdminHeader";
import { AdminStats } from "./AdminStats";
import { PrizesSection } from "./PrizesSection";
import { EntriesSection } from "./EntriesSection";
import { LotteriesSection } from "./lotteries/LotteriesSection";
import { useLotteryStatus } from "@/hooks/useLotteryStatus";
import { useAdminPrizes } from "@/hooks/useAdminPrizes";
import { useLotteryEntries } from "@/hooks/useLotteryEntries";
import { useToggleLottery } from "@/hooks/useToggleLottery";
import { useAdminState } from "@/hooks/useAdminState";
import { useActiveLottery } from "@/hooks/useActiveLottery";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  remaining_quantity: number;
  draw_date: string;
  created_at: string;
}

interface AdminContentProps {
  onLogout: () => Promise<void>;
}

export const AdminContent = ({ onLogout }: AdminContentProps) => {
  const { data: lotteryStatus } = useLotteryStatus();
  const { data: activeLottery } = useActiveLottery();
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
    sortColumn: entriesSortColumn,
    sortDirection: entriesSortDirection,
    page: entriesPage,
    setPage: setEntriesPage,
    handleSort: handleEntriesSort,
    selectedDate: entriesSelectedDate,
    setSelectedDate: setEntriesSelectedDate,
  } = useLotteryEntries();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg space-y-12">
      <AdminHeader
        isLocked={lotteryStatus?.is_locked || false}
        isLoading={!lotteryStatus}
        isPending={toggleLockMutation.isPending}
        onToggleLock={() => {
          if (activeLottery?.id) {
            toggleLockMutation.mutate(activeLottery.id);
          }
        }}
        onLogout={onLogout}
      />

      <AdminStats
        entriesCount={totalEntries || 0}
        prizesCount={totalPrizes || 0}
      />

      <div className="space-y-16">
        <LotteriesSection />

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

        <EntriesSection 
          entries={entries || []}
          sortColumn={entriesSortColumn}
          sortDirection={entriesSortDirection}
          page={entriesPage}
          onPageChange={setEntriesPage}
          onSort={handleEntriesSort}
          selectedDate={entriesSelectedDate}
          onDateChange={setEntriesSelectedDate}
        />
      </div>
    </div>
  );
};
