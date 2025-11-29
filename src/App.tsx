import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FlagsProvider } from "@/contexts/FeatureFlagContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import Pipelines from "./pages/Pipelines";
import PipelineDetail from "./pages/PipelineDetail";
import PipelineSettings from "./pages/PipelineSettings";
import PipelineStages from "./pages/PipelineStages";
import Contacts from "./pages/Contacts";
import Inboxes from "./pages/Inboxes";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import WhatsAppSuccess from "./pages/WhatsAppSuccess";
import WhatsAppError from "./pages/WhatsAppError";
import MagicPipeline from "./pages/MagicPipeline";
import ConnectionSuccess from "./pages/ConnectionSuccess";
import ConnectionError from "./pages/ConnectionError";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import OpportunityDetail from "./pages/OpportunityDetail";
import Profile from "./pages/Profile";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable aggressive refetching that causes page refreshes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FlagsProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/log-in" element={<AuthPage mode="login" />} />
              <Route path="/sign-up" element={<AuthPage mode="signup" />} />
              <Route path="/connection-success" element={<ConnectionSuccess />} />
              <Route path="/connection-error" element={<ConnectionError />} />
              <Route path="/whatsapp-success" element={<WhatsAppSuccess />} />
              <Route path="/whatsapp-error" element={<WhatsAppError />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />
              <Route path="/pipelines/:id" element={<ProtectedRoute><PipelineDetail /></ProtectedRoute>} />
              <Route path="/pipelines/:id/stages" element={<ProtectedRoute><PipelineStages /></ProtectedRoute>} />
              <Route path="/pipelines/:id/settings" element={<ProtectedRoute><PipelineSettings /></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
              <Route path="/inboxes" element={<ProtectedRoute><Inboxes /></ProtectedRoute>} />
              {/* NEW: Pipeline-specific inbox routing with optional conversation */}
              <Route path="/inboxes/:pipelineId" element={<ProtectedRoute><Inboxes /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/agents/:id" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
              <Route path="/magic-pipeline" element={<ProtectedRoute><MagicPipeline /></ProtectedRoute>} />
              <Route path="/opportunity-detail/:id" element={<ProtectedRoute><OpportunityDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </FlagsProvider>
  </QueryClientProvider>
);

export default App;