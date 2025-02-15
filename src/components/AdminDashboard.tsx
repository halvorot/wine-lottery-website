import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminStats } from "./admin/AdminStats";
import { PrizesSection } from "./admin/PrizesSection";
import { EntriesSection } from "./admin/EntriesSection";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useLotteryStatus } from "@/hooks/useLotteryStatus";
import { useLotteryEntries } from "@/hooks/useLotteryEntries";
import { useQuery } from "@tanstack/react-query";

type SortColumn = "name" | "quantity" | "draw_date" | "created_at";
type SortDirection = "asc" | "desc";

export const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdminError, setShowAdminError] = useState(false);
  const { isAuthenticated, isAdmin } = useAuthStatus();
  const lotteryStatus = useLotteryStatus();
  const { 
    todayEntries: entries,
    totalCount: entriesCount,
  } = useLotteryEntries();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const entriesPerPage = 10;

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
      
      return data.is_locked;
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login with Email"}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Login with Google
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </form>
      </div>
    );
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-4">You need admin privileges to access this section.</p>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            Return to Home
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    );
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
        prizesCount={entriesCount || 0}
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
