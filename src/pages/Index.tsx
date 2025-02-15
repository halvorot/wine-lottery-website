
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";
import { PasswordVerificationModal } from "@/components/PasswordVerificationModal";
import { usePasswordVerification } from "@/contexts/PasswordVerificationContext";
import { useEffect, useState } from "react";

const Index = () => {
  const { isVerified, setVerified } = usePasswordVerification();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isVerified) {
      setShowModal(true);
    }
  }, [isVerified]);

  const handleVerified = () => {
    setVerified(true);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-white text-charcoal">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <PasswordVerificationModal
          isOpen={showModal}
          onVerified={handleVerified}
        />
        
        {isVerified ? (
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
        ) : (
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Access Required</h1>
            <p>Please enter today's password to access the wine lottery.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
