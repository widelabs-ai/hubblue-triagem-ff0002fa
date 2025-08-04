
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HospitalProvider } from "@/contexts/HospitalContext";
import { UserProvider } from "@/contexts/UserContext";
import AppRoutes from "./routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <UserProvider>
          <HospitalProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </HospitalProvider>
        </UserProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
