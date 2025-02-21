
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordVerificationModal } from "@/components/PasswordVerificationModal";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { useActiveLottery } from "@/hooks/useActiveLottery";
import { useCallback } from "react";

const Index = () => {
  const { isVerified, setVerified } = usePasswordVerification();
  const { data: activeLottery, isLoading: isLoadingLottery } = useActiveLottery();

  const handleVerified = () => {
    setVerified(true);
  };

  const shouldShowPasswordVerification = useCallback((tab: string) => {
    // Don't show password verification for admin tab
    if (tab === "admin") return false;
    
    // Don't show password verification if there's no active lottery
    if (!activeLottery) return false;
    
    // Show password verification for lottery and live tabs if not verified
    return !isVerified && (tab === "lottery" || tab === "live");
  }, [isVerified, activeLottery]);

  return (
    <div className="min-h-screen bg-white text-charcoal">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Tabs defaultValue="lottery" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mx-auto mb-8">
            <TabsTrigger value="lottery">Lottery</TabsTrigger>
            <TabsTrigger value="live">Live Draw</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Show loading state while checking for active lottery */}
          {isLoadingLottery ? (
            <div className="text-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-wine border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <TabsContent value="lottery">
                <PasswordVerificationModal
                  isOpen={shouldShowPasswordVerification("lottery")}
                  onVerified={handleVerified}
                />
                <LotteryTab />
              </TabsContent>

              <TabsContent value="live">
                <PasswordVerificationModal
                  isOpen={shouldShowPasswordVerification("live")}
                  onVerified={handleVerified}
                />
                <LiveDrawTab />
              </TabsContent>

              <TabsContent value="admin">
                <AdminDashboard />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
