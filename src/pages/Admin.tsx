
import { AdminDashboard } from "@/components/AdminDashboard";
import { NavigationHeader } from "@/components/NavigationHeader";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main className="container mx-auto py-8">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default Admin;
