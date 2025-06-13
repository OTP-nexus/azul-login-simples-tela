
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserTypeSelection from "./pages/UserTypeSelection";
import CompanyRegistration from "./pages/CompanyRegistration";
import CompanyTypeSelection from "./pages/CompanyTypeSelection";
import DriverRegistration from "./pages/DriverRegistration";
import DocumentVerification from "./pages/DocumentVerification";
import DriverDocumentVerification from "./pages/DriverDocumentVerification";
import CompanyDashboard from "./pages/CompanyDashboard";
import FreightRequest from "./pages/FreightRequest";
import FreightAggregation from "./pages/FreightAggregation";
import FreightComplete from "./pages/FreightComplete";
import FreightReturn from "./pages/FreightReturn";
import CollaboratorRegistration from "./pages/CollaboratorRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/freight-request" element={<FreightRequest />} />
            <Route path="/freight-aggregation" element={<FreightAggregation />} />
            <Route path="/freight-complete" element={<FreightComplete />} />
            <Route path="/freight-return" element={<FreightReturn />} />
            <Route path="/collaborator-registration" element={<CollaboratorRegistration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
