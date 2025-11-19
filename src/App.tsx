import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Projects from "./pages/Projects";
import ScientificProduction from "./pages/ScientificProduction";
import Impacts from "./pages/Impacts";
import Vinculacion from "./pages/Vinculacion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <MainLayout><Projects /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/production" element={
              <ProtectedRoute>
                <MainLayout><ScientificProduction /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/impacts" element={
              <ProtectedRoute>
                <MainLayout><Impacts /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/vinculacion" element={
              <ProtectedRoute>
                <MainLayout><Vinculacion /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
