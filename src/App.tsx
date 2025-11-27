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
import Profile from "./pages/Profile";
import Evaluation from "./pages/Evaluation";
import PendingApprovals from "./pages/admin/PendingApprovals";
import UserDirectory from "./pages/admin/UserDirectory";
import Institutional from "./pages/Institutional";
import Tasks from "./pages/Tasks";
import Planning from "./pages/admin/Planning";
import PlanningBuilder from "./pages/admin/PlanningBuilder";
import Settings from "./pages/admin/Settings";
import OfficialProjectsList from "./pages/admin/OfficialProjectsList";

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
            <Route path="/evaluation" element={
              <ProtectedRoute>
                <MainLayout><Evaluation /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pending-approvals" element={
              <ProtectedRoute>
                <MainLayout><PendingApprovals /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <MainLayout><UserDirectory /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <MainLayout><Tasks /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/institutional" element={
              <ProtectedRoute>
                <MainLayout><Institutional /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/planning" element={
              <ProtectedRoute>
                <MainLayout><Planning /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/planning/new" element={
              <ProtectedRoute>
                <MainLayout><PlanningBuilder /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/planning/:id" element={
              <ProtectedRoute>
                <MainLayout><PlanningBuilder /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <MainLayout><Settings /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/projects-list" element={
              <ProtectedRoute>
                <MainLayout><OfficialProjectsList /></MainLayout>
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
