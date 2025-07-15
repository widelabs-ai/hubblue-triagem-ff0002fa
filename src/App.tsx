
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HospitalProvider } from "@/contexts/HospitalContext";
import { UserProvider, useUser } from "@/contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginScreen from "./components/LoginScreen";
import UserManagement from "./components/UserManagement";
import TotemScreen from "./components/TotemScreen";
import TriageScreen from "./components/TriageScreen";
import AdminScreen from "./components/AdminScreen";
import DoctorScreen from "./components/DoctorScreen";
import MonitoringDashboard from "./components/MonitoringDashboard";
import ReportsScreen from "./components/ReportsScreen";
import Header from "./components/Header";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HospitalProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/usuarios" element={<UserManagement />} />
          <Route path="/totem" element={<TotemScreen />} />
          <Route path="/triagem" element={<TriageScreen />} />
          <Route path="/administrativo" element={<AdminScreen />} />
          <Route path="/medico" element={<DoctorScreen />} />
          <Route path="/monitoramento" element={<MonitoringDashboard />} />
          <Route path="/relatorios" element={<ReportsScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HospitalProvider>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
