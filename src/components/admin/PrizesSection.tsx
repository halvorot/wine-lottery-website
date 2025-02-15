
import { AddPrizeForm } from "@/components/AddPrizeForm";
import { PrizesTable } from "@/components/admin/PrizesTable";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  remaining_quantity: number;
  draw_date: string;
  created_at: string;
}

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

interface PrizesSectionProps {
  prizes: Prize[];
  isLoading: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  page: number;
  totalCount: number;
  entriesPerPage: number;
  onSort: (column: SortColumn) => void;
  onPageChange: (page: number) => void;
}

export const PrizesSection = ({
  prizes,
  isLoading,
  sortColumn,
  sortDirection,
  page,
  totalCount,
  entriesPerPage,
  onSort,
  onPageChange,
}: PrizesSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="bg-cream/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Prize</h3>
        <AddPrizeForm />
      </div>

      {!isLoading && prizes && (
        <PrizesTable
          prizes={prizes}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          page={page}
          totalCount={totalCount}
          entriesPerPage={entriesPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
