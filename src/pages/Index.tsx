
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordVerificationModal } from "@/components/PasswordVerificationModal";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useCallback, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { isVerified, setVerified } = usePasswordVerification();
  const { data: activeLottery, isLoading: isLoadingLottery, error: lotteryError } = useActiveLottery();
  const { isAdmin } = useAuthStatus();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { toast } = useToast();

  // Handle tab from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
      setSearchParams({ tab: "lottery" });
    }
  }, [searchParams, setSearchParams]);

  // Handle errors
  useEffect(() => {
    if (lotteryError) {
      toast({
        title: "Error",
        description: "Failed to load lottery data. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [lotteryError, toast]);

  const handleVerified = () => {
    setVerified(true);
    setShowPasswordModal(false);
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
  };

  const shouldShowPasswordVerification = useCallback((tab: string) => {
    if (tab === "admin" || isAdmin) return false;
    if (!activeLottery) return false;
    return !isVerified && (tab === "lottery" || tab === "live");
  }, [isVerified, activeLottery, isAdmin]);

  const renderTabContent = (tab: string, content: React.ReactNode) => {
    if (shouldShowPasswordVerification(tab)) {
      return (
        <div className="text-center p-8">
          <p className="mb-4">Please verify the lottery password to view this content.</p>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-wine text-white rounded hover:bg-wine/90 transition-colors"
          >
            Enter Password
          </button>
        </div>
      );
    }
    return content;
  };

  const currentTab = searchParams.get("tab") || "lottery";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-white text-charcoal">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mx-auto mb-8">
            <TabsTrigger value="lottery">Lottery</TabsTrigger>
            <TabsTrigger value="live">Live Draw</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {isLoadingLottery ? (
            <div className="text-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-wine border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <TabsContent value="lottery">
                {renderTabContent("lottery", <LotteryTab />)}
              </TabsContent>

              <TabsContent value="live">
                {renderTabContent("live", <LiveDrawTab />)}
              </TabsContent>

              <TabsContent value="admin">
                <AdminDashboard />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <PasswordVerificationModal
        isOpen={showPasswordModal}
        onVerified={handleVerified}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
