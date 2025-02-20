
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordVerificationModal } from "@/components/PasswordVerificationModal";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { useActiveLottery } from "@/hooks/useActiveLottery";

const Index = () => {
  const { isVerified, setVerified } = usePasswordVerification();
  const { data: activeLottery, isLoading: isLoadingLottery } = useActiveLottery();

  const handleVerified = () => {
    setVerified(true);
  };

  // Don't show password verification if there's no active lottery
  const shouldShowPasswordVerification = isVerified === false && activeLottery !== null;

  return (
    <div className="min-h-screen bg-white text-charcoal">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <PasswordVerificationModal
          isOpen={shouldShowPasswordVerification}
          onVerified={handleVerified}
        />
        
        {/* Show loading state while checking for active lottery */}
        {isLoadingLottery ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-wine border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <Tabs defaultValue="lottery" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-3 max-w-[400px] mx-auto mb-8">
              <TabsTrigger value="lottery">Lottery</TabsTrigger>
              <TabsTrigger value="live">Live Draw</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="lottery">
              <LotteryTab />
            </TabsContent>

            <TabsContent value="live">
              <LiveDrawTab />
            </TabsContent>

            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
