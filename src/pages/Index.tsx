import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Spinner } from "@/components/ui/spinner";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useEffect, useState } from "react";
import { PasswordProtectedRoute } from "@/components/PasswordProtectedRoute";
import { Wine, Ticket, ShieldCheck } from "lucide-react";

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
        <div className="border-b border-gray-200 mb-8">
          <TabsList className="w-full flex justify-center space-x-2 sm:space-x-8 bg-transparent">
            <TabsTrigger 
              value="lottery" 
              className="flex items-center gap-2 px-4 py-3 text-charcoal/80 hover:text-wine data-[state=active]:text-wine data-[state=active]:border-b-2 data-[state=active]:border-wine -mb-px transition-all duration-200 font-medium"
            >
              <Wine size={18} className="flex-shrink-0" />
              <span>Lottery</span>
            </TabsTrigger>
            <TabsTrigger 
              value="live-draw" 
              className="flex items-center gap-2 px-4 py-3 text-charcoal/80 hover:text-wine data-[state=active]:text-wine data-[state=active]:border-b-2 data-[state=active]:border-wine -mb-px transition-all duration-200 font-medium"
            >
              <Ticket size={18} className="flex-shrink-0" />
              <span>Live Draw</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2 px-4 py-3 text-charcoal/80 hover:text-wine data-[state=active]:text-wine data-[state=active]:border-b-2 data-[state=active]:border-wine -mb-px transition-all duration-200 font-medium"
            >
              <ShieldCheck size={18} className="flex-shrink-0" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
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
