
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordVerificationModal } from "@/components/PasswordVerificationModal";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useCallback, useState } from "react";

const Index = () => {
  const { isVerified, setVerified } = usePasswordVerification();
  const { data: activeLottery, isLoading: isLoadingLottery } = useActiveLottery();
  const { isAdmin } = useAuthStatus();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleVerified = () => {
    setVerified(true);
    setShowPasswordModal(false);
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
  };

  const shouldShowPasswordVerification = useCallback((tab: string) => {
    // Don't show password verification for admin tab or if user is admin
    if (tab === "admin" || isAdmin) return false;
    
    // Don't show password verification if there's no active lottery
    if (!activeLottery) return false;
    
    // Show password verification for lottery and live tabs if not verified
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

  // Only show loading state during initial data fetch
  if (isLoadingLottery) {
    return (
      <div className="min-h-screen bg-white text-charcoal flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-wine border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-charcoal">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Tabs defaultValue="lottery" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mx-auto mb-8">
            <TabsTrigger value="lottery">Lottery</TabsTrigger>
            <TabsTrigger value="live">Live Draw</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="lottery">
            {renderTabContent("lottery", <LotteryTab />)}
          </TabsContent>

          <TabsContent value="live">
            {renderTabContent("live", <LiveDrawTab />)}
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
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
