import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import { setupDeepLinkHandler } from "@/lib/deeplink";
import { setupPushNotifications, teardownPushNotifications } from "@/lib/pushNotifications";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Dashboard from "@/pages/Dashboard";
import PatientList from "@/pages/PatientList";
import PatientDetail from "@/pages/PatientDetail";
import PatientProgress from "@/pages/PatientProgress";
import PatientRequests from "@/pages/PatientRequests";
import ChatScreen from "@/pages/ChatScreen";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
      <BottomNav />
    </ProtectedRoute>
  );
}

function DeepLinkBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    return setupDeepLinkHandler(navigate);
  }, [navigate]);
  return null;
}

function PushBridge() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.id) {
      void setupPushNotifications(user.id, navigate);
    }
    return () => {
      void teardownPushNotifications();
    };
  }, [user?.id, navigate]);
  return null;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DeepLinkBridge />
            <PushBridge />
            <div className="mx-auto max-w-lg">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/patients/:id/progress" element={<PatientProgress />} />
                  <Route path="/requests" element={<PatientRequests />} />
                  <Route path="/chat" element={<ChatScreen />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
