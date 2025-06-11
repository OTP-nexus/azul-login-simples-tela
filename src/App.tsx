
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserTypeSelectionPage from "./pages/UserTypeSelection";
import DriverRegistration from "./pages/DriverRegistration";
import CompanyRegistration from "./pages/CompanyRegistration";
import DocumentVerification from "./pages/DocumentVerification";
import DriverDocumentVerification from "./pages/DriverDocumentVerification";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component is rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<UserTypeSelectionPage />} />
              <Route path="/register/driver" element={<DriverRegistration />} />
              <Route path="/register/company" element={<CompanyRegistration />} />
              <Route path="/document-verification" element={<DocumentVerification />} />
              <Route path="/driver-document-verification" element={<DriverDocumentVerification />} />
              <Route path="/company-dashboard" element={<CompanyDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
