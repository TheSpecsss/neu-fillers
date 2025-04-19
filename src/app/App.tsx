import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AppRoutes />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
); 