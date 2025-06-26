
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HospitalProvider } from "@/contexts/HospitalContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TotemScreen from "./components/TotemScreen";
import TriageScreen from "./components/TriageScreen";
import AdminScreen from "./components/AdminScreen";
import DoctorScreen from "./components/DoctorScreen";
import MonitoringDashboard from "./components/MonitoringDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HospitalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/totem" element={<TotemScreen />} />
            <Route path="/triagem" element={<TriageScreen />} />
            <Route path="/administrativo" element={<AdminScreen />} />
            <Route path="/medico" element={<DoctorScreen />} />
            <Route path="/monitoramento" element={<MonitoringDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </HospitalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
