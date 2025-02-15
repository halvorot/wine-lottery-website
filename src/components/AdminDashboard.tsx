
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Users, Lock, Unlock } from "lucide-react";
import { AddPrizeForm } from "@/components/AddPrizeForm";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lotteryStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["lottery-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lottery_status")
        .select("*")
        .eq("date", new Date().toISOString().split("T")[0])
        .single();

      if (error) throw error;
      return data;
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

  const toggleLockMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("lottery_status")
        .update({
          is_locked: !lotteryStatus?.is_locked,
          locked_at: !lotteryStatus?.is_locked ? new Date().toISOString() : null,
        })
        .eq("date", new Date().toISOString().split("T")[0]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lottery-status"] });
      toast({
        title: "Success",
        description: `Lottery ${
          lotteryStatus?.is_locked ? "unlocked" : "locked"
        } successfully!`,
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
          <p className="text-2xl font-bold">3</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-cream/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Prize</h3>
          <AddPrizeForm />
        </div>

        <div className="overflow-x-auto">
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
}
