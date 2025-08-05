

import { Navigate, Route, Routes } from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import UserManagement from "@/components/UserManagement";
import TotemScreen from "@/components/TotemScreen";
import TriageScreen from "@/components/TriageScreen";
import AdminScreen from "@/components/AdminScreen";
import DoctorScreen from "@/components/DoctorScreen";
import MonitoringDashboard from "@/components/MonitoringDashboard";
import ReportsScreen from "@/components/ReportsScreen";

const PrivateRoutes = () => {
   return(
       <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home"  element={<Index />}/>           
            <Route path="/usuarios" element={<UserManagement />} />
            <Route path="/totem" element={<TotemScreen />} />
            <Route path="/triagem" element={<TriageScreen />} />
            <Route path="/administrativo" element={<AdminScreen />} />
            <Route path="/medico" element={<DoctorScreen />} />
            <Route path="/monitoramento" element={<MonitoringDashboard />} />
            <Route path="/relatorios" element={<ReportsScreen />} />
            <Route path="*" element={<NotFound />} />
       </Routes>
   )
}

export default PrivateRoutes;