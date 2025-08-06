
import { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HospitalProvider } from "@/contexts/HospitalContext";
import { RouterProvider } from 'react-router-dom';
import { UserProvider } from "@/contexts/UserContext";
import AuthRoutes from "./routes/authRoutes";
import { router } from "./routes";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <HospitalProvider>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>}>
              <RouterProvider router={router} />
            </Suspense>
            <Toaster />
            <Sonner />
          </HospitalProvider>
        </UserProvider>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
