
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  page: number;
  totalCount: number;
  entriesPerPage: number;
  onPageChange: (newPage: number) => void;
  renderActions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalCount,
  entriesPerPage,
  onPageChange,
  renderActions,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalCount / entriesPerPage);
  const startIndex = totalCount === 0 ? 0 : ((page - 1) * entriesPerPage) + 1;
  const endIndex = Math.min(page * entriesPerPage, totalCount);

  const handleSort = (column: string) => {
    if (!onSort || !column) return;
    onSort(column);
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={column.sortable ? "cursor-pointer select-none" : undefined}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
              {renderActions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (renderActions ? 1 : 0)} 
                  className="text-center py-8 text-muted-foreground"
                >
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] ?? '')}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell>{renderActions(item)}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {totalCount === 0 ? (
            "No items found"
          ) : (
            `Showing ${startIndex} to ${endIndex} of ${totalCount} items`
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || totalCount === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || totalCount === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
