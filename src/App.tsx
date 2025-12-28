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
import { TourProvider } from "./components/tour/TourProvider";
import Evaluation from "./pages/Evaluation";
import PendingApprovals from "./pages/admin/PendingApprovals";
import UserDirectory from "./pages/admin/UserDirectory";
import Institutional from "./pages/Institutional";
import Tasks from "./pages/Tasks";
import Planning from "./pages/admin/Planning";
import PlanningBuilder from "./pages/admin/PlanningBuilder";
import Settings from "./pages/admin/Settings";
import OfficialProjectsList from "./pages/admin/OfficialProjectsList";
import EvaluationReviews from "./pages/admin/EvaluationReviews";
import TaskReviews from "./pages/admin/TaskReviews";
import MyTasks from "./pages/MyTasks";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import LegalNotice from "./pages/legal/LegalNotice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TourProvider>
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
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><PendingApprovals /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
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
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><Planning /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/planning/new" element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><PlanningBuilder /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/planning/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><PlanningBuilder /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><Settings /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/projects-list" element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><OfficialProjectsList /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/evaluations" element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><EvaluationReviews /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/task-reviews" element={
                <ProtectedRoute requiredRole="admin">
                  <MainLayout><TaskReviews /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-tasks" element={
                <ProtectedRoute>
                  <MainLayout><MyTasks /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/notice" element={<LegalNotice />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TourProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
