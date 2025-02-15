
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Auth from "@/pages/Auth";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminStats } from "./admin/AdminStats";
import { PrizesSection } from "./admin/PrizesSection";
import { EntriesSection } from "./admin/EntriesSection";
import { useAuthStatus } from "@/hooks/useAuthStatus";

type LotteryStatus = {
  id: string;
  date: string;
  is_locked: boolean;
  locked_at: string | null;
  created_at: string;
}

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const entriesPerPage = 10;
  const { isAuthenticated, isAdmin } = useAuthStatus();
  const [showAdminError, setShowAdminError] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isAdmin && !showAdminError) {
      setShowAdminError(true);
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this section.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isAdmin, toast, showAdminError]);

  const { data: lotteryStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const { data: existingStatus, error: fetchError } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", today)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (!existingStatus) {
        const { data: newStatus, error: createError } = await supabase
          .from("lottery_status")
          .insert([{ date: today, is_locked: false }])
          .select()
          .single();
          
        if (createError) throw createError;
        return newStatus as LotteryStatus;
      }
      
      return existingStatus as LotteryStatus;
    },
  });

  const { data: entries } = useQuery({
    queryKey: ["today-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_entries")
        .select("*")
        .eq("entry_date", new Date().toISOString().split("T")[0]);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: prizes, isLoading: isPrizesLoading } = useQuery({
    queryKey: ["prizes", sortColumn, sortDirection, page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prizes")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range((page - 1) * entriesPerPage, page * entriesPerPage - 1);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: totalPrizes } = useQuery({
    queryKey: ["prizes-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("prizes")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const newLockedStatus = !lotteryStatus?.is_locked;
      
      const { data, error } = await supabase
        .from("lottery_status")
        .update({ 
          is_locked: newLockedStatus,
          locked_at: newLockedStatus ? new Date().toISOString() : null
        })
        .eq("date", today)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return (data as LotteryStatus).is_locked;
    },
    onSuccess: (newLockedStatus) => {
      queryClient.invalidateQueries({ queryKey: ["lottery-status"] });
      toast({
        title: "Success",
        description: `Lottery ${newLockedStatus ? "locked" : "unlocked"} successfully!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lottery status. Please try again.",
        variant: "destructive",
      });
      console.error("Toggle lock error:", error);
    },
  });

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
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!isAuthenticated) {
    return <Auth />;
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-4">You need admin privileges to access this section.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
      <AdminHeader
        isLocked={lotteryStatus?.is_locked || false}
        isLoading={isStatusLoading}
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
