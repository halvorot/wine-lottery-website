
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { PasswordVerificationProvider, usePasswordVerification } from "./contexts/PasswordVerificationContext";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const queryClient = new QueryClient();

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuthStatus();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <Admin />
          </ProtectedAdminRoute>
        } 
      />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <PasswordVerificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </PasswordVerificationProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
