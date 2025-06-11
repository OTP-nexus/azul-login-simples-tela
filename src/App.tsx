
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserTypeSelection from "./pages/UserTypeSelection";
import CompanyRegistration from "./pages/CompanyRegistration";
import CompanyTypeSelection from "./pages/CompanyTypeSelection";
import DriverRegistration from "./pages/DriverRegistration";
import DocumentVerification from "./pages/DocumentVerification";
import DriverDocumentVerification from "./pages/DriverDocumentVerification";
import CompanyDashboard from "./pages/CompanyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserTypeSelection />} />
          <Route path="/register/company" element={<CompanyTypeSelection />} />
          <Route path="/register/company/form" element={<CompanyRegistration />} />
          <Route path="/register/driver" element={<DriverRegistration />} />
          <Route path="/document-verification" element={<DocumentVerification />} />
          <Route path="/driver-document-verification" element={<DriverDocumentVerification />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
