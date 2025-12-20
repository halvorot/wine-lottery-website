
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { PasswordVerificationProvider } from "@/contexts/PasswordVerificationContext";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ResetPasswordPage from "@/pages/ResetPassword";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PasswordVerificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
          <Toaster />
        </Router>
      </PasswordVerificationProvider>
    </AuthProvider>
  );
}

export default App;
