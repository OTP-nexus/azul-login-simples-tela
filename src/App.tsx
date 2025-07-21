
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserTypeSelection from "./pages/UserTypeSelection";
import DriverRegistration from "./pages/DriverRegistration";
import CompanyRegistration from "./pages/CompanyRegistration";
import CompanyTypeSelection from "./pages/CompanyTypeSelection";
import CollaboratorRegistration from "./pages/CollaboratorRegistration";
import DriverDashboard from "./pages/DriverDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import DriverProfile from "./pages/DriverProfile";
import CompanyProfile from "./pages/CompanyProfile";
import DocumentVerification from "./pages/DocumentVerification";
import DriverDocumentVerification from "./pages/DriverDocumentVerification";
import FreightRequest from "./pages/FreightRequest";
import FreightAggregation from "./pages/FreightAggregation";
import FreightReturn from "./pages/FreightReturn";
import FreightComplete from "./pages/FreightComplete";
import FreightDetails from "./pages/FreightDetails";
import ActiveFreights from "./pages/ActiveFreights";
import PublicFreightsList from "./pages/PublicFreightsList";
import PublicFreightRequest from "./pages/PublicFreightRequest";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import DriverPlans from "./pages/DriverPlans";
import CompanyPlans from "./pages/CompanyPlans";

const queryClient = new QueryClient();

function App() {
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
              <Route path="/user-type-selection" element={<UserTypeSelection />} />
              <Route path="/driver-registration" element={<DriverRegistration />} />
              <Route path="/company-registration" element={<CompanyRegistration />} />
              <Route path="/company-type-selection" element={<CompanyTypeSelection />} />
              <Route path="/collaborator-registration" element={<CollaboratorRegistration />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/public-freights" element={<PublicFreightsList />} />
              <Route path="/public-freight-request" element={<PublicFreightRequest />} />
              
              {/* Rotas protegidas */}
              <Route path="/driver-dashboard" element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/company-dashboard" element={
                <ProtectedRoute>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver-profile" element={
                <ProtectedRoute>
                  <DriverProfile />
                </ProtectedRoute>
              } />
              <Route path="/company-profile" element={
                <ProtectedRoute>
                  <CompanyProfile />
                </ProtectedRoute>
              } />
              <Route path="/document-verification" element={
                <ProtectedRoute>
                  <DocumentVerification />
                </ProtectedRoute>
              } />
              <Route path="/driver-document-verification" element={
                <ProtectedRoute>
                  <DriverDocumentVerification />
                </ProtectedRoute>
              } />
              <Route path="/freight-request" element={
                <ProtectedRoute>
                  <FreightRequest />
                </ProtectedRoute>
              } />
              <Route path="/freight-aggregation" element={
                <ProtectedRoute>
                  <FreightAggregation />
                </ProtectedRoute>
              } />
              <Route path="/freight-return" element={
                <ProtectedRoute>
                  <FreightReturn />
                </ProtectedRoute>
              } />
              <Route path="/freight-complete" element={
                <ProtectedRoute>
                  <FreightComplete />
                </ProtectedRoute>
              } />
              <Route path="/freight/:id" element={
                <ProtectedRoute>
                  <FreightDetails />
                </ProtectedRoute>
              } />
              <Route path="/active-freights" element={
                <ProtectedRoute>
                  <ActiveFreights />
                </ProtectedRoute>
              } />
              
              {/* Rotas de planos */}
              <Route path="/driver/plans" element={
                <ProtectedRoute>
                  <DriverPlans />
                </ProtectedRoute>
              } />
              <Route path="/company/plans" element={
                <ProtectedRoute>
                  <CompanyPlans />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
