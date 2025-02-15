
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Users, Lock, Unlock } from "lucide-react";
import { AddPrizeForm } from "@/components/AddPrizeForm";
import { PrizesTable } from "@/components/admin/PrizesTable";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "@/pages/Auth";

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
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  // If not authenticated, show the Auth component
  if (!session) {
    return <Auth />;
  }

  // If authenticated but not admin, show access denied
  if (session && !isAdmin) {
    toast({
      title: "Access Denied",
      description: "You need admin privileges to access this section.",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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
          .insert([
            { 
              date: today,
              is_locked: false 
            }
          ])
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

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPage(1);
  };

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="space-x-4">
          <Button
            onClick={() => toggleLockMutation.mutate()}
            disabled={isStatusLoading || toggleLockMutation.isPending}
            className={`${
              lotteryStatus?.is_locked
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {lotteryStatus?.is_locked ? (
              <>
                <Unlock className="mr-2" /> Unlock Entries
              </>
            ) : (
              <>
                <Lock className="mr-2" /> Lock Entries
              </>
            )}
          </Button>
          <Button className="bg-wine hover:bg-wine-light text-white">
            Draw Winner
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-cream rounded-lg p-6">
          <Users className="mb-2" />
          <h3 className="text-xl font-semibold">Total Entries</h3>
          <p className="text-2xl font-bold">{entries?.length || 0}</p>
        </div>
        <div className="bg-cream rounded-lg p-6">
          <Timer className="mb-2" />
          <h3 className="text-xl font-semibold">Time Left</h3>
          <p className="text-2xl font-bold">03:45:22</p>
        </div>
        <div className="bg-cream rounded-lg p-6">
          <Trophy className="mb-2" />
          <h3 className="text-xl font-semibold">Total Prizes</h3>
          <p className="text-2xl font-bold">{totalPrizes || 0}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-cream/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Prize</h3>
          <AddPrizeForm />
        </div>

        {!isPrizesLoading && prizes && (
          <PrizesTable
            prizes={prizes}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            page={page}
            totalCount={totalPrizes || 0}
            entriesPerPage={entriesPerPage}
            onPageChange={setPage}
          />
        )}

        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Today's Entries</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Tickets</th>
                <th className="text-left p-4">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((entry) => (
                <tr key={entry.id} className="border-b">
                  <td className="p-4">{entry.name}</td>
                  <td className="p-4">{entry.email || "-"}</td>
                  <td className="p-4">{entry.num_tickets}</td>
                  <td className="p-4">
                    {new Date(entry.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

