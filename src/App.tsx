import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import Dashboard from "@/pages/Dashboard";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import PatientProgress from "@/pages/PatientProgress";
import PatientRequests from "@/pages/PatientRequests";
import ChatScreen from "@/pages/ChatScreen";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="mx-auto max-w-lg">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
                <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
                <Route path="/patients/:id/progress" element={<ProtectedRoute><PatientProgress /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><PatientRequests /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
