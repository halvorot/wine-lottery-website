
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryTab } from "@/components/LotteryTab";
import { LiveDrawTab } from "@/components/LiveDrawTab";
import { AdminDashboard } from "@/components/AdminDashboard";

const Index = () => {
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
            <LotteryTab />
          </TabsContent>

          <TabsContent value="live">
            <LiveDrawTab />
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
