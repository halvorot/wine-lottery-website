
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PasswordVerificationProvider } from "./contexts/PasswordVerificationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ensures proper cache invalidation across browsers
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Shorter stale time to prevent stale data issues
      staleTime: 1000 * 30,
      // Retry failed requests a limited number of times
      retry: 2,
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <PasswordVerificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </PasswordVerificationProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
