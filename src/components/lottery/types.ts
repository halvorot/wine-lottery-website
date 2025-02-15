
export interface LotteryEntry {
  id: string;
  name: string;
  email: string;
  num_tickets: number;
  created_at: string;
}

export type SortColumn = "name" | "email" | "num_tickets" | "created_at";
export type SortDirection = "asc" | "desc";
