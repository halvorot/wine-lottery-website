import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Spinner } from "@/components/ui/spinner";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useEffect, useState } from "react";
import { PasswordProtectedRoute } from "@/components/PasswordProtectedRoute";

const Index = () => {
  const { isAdmin, isAuthenticated, isLoading: isAuthLoading } = useAuthStatus();
  const { data: activeLottery, isLoading: isLotteryLoading } = useActiveLottery();
  const [tab, setTab] = useState<string>("lottery");

  // Auto-select admin tab if user is admin
  useEffect(() => {
    if (isAdmin && !isAuthLoading) {
      setTab("admin");
    }
  }, [isAdmin, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Spinner size="lg" />
        <p className="mt-4 text-wine">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/25 p-8">
      <Tabs defaultValue={tab} value={tab} onValueChange={setTab} className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="lottery">Lottery</TabsTrigger>
          <TabsTrigger value="live-draw">Live Draw</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        {/* Lottery Tab Content */}
        <TabsContent value="lottery">
          <PasswordProtectedRoute>
            <LotteryTab />
          </PasswordProtectedRoute>
        </TabsContent>
        
        {/* Live Draw Tab Content */}
        <TabsContent value="live-draw">
          <PasswordProtectedRoute>
            <LiveDrawTab />
          </PasswordProtectedRoute>
        </TabsContent>
        
        {/* Admin Tab Content - No password protection */}
        <TabsContent value="admin">
          <AdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
