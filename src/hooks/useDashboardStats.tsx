import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DashboardStats {
  // For all users
  myActiveProjects: number;
  myPendingTasks: number;
  myEvaluationStatus: 'none' | 'draft' | 'submitted' | 'observed' | 'approved';
  myEvaluationScore: number | null;
  
  // Admin only
  pendingEvaluations: number;
  pendingTaskReviews: number;
  pendingApprovals: number;
}

export const useDashboardStats = (isAdmin: boolean) => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id, isAdmin, currentYear],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) {
        return {
          myActiveProjects: 0,
          myPendingTasks: 0,
          myEvaluationStatus: 'none',
          myEvaluationScore: null,
          pendingEvaluations: 0,
          pendingTaskReviews: 0,
          pendingApprovals: 0,
        };
      }

      // Fetch user's active projects
      const { count: activeProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("investigator_id", user.id)
        .eq("status", "In Progress");

      // Fetch user's pending tasks
      const { count: pendingTasks } = await supabase
        .from("assigned_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pending");

      // Fetch user's evaluation for current year
      const { data: evaluation } = await supabase
        .from("evaluation_reports")
        .select("status, total_score")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .maybeSingle();

      let evaluationStatus: DashboardStats['myEvaluationStatus'] = 'none';
      if (evaluation) {
        if (evaluation.status === 'approved') evaluationStatus = 'approved';
        else if (evaluation.status === 'observed') evaluationStatus = 'observed';
        else if (evaluation.status === 'submitted') evaluationStatus = 'submitted';
        else evaluationStatus = 'draft';
      }

      let adminStats = {
        pendingEvaluations: 0,
        pendingTaskReviews: 0,
        pendingApprovals: 0,
      };

      // Fetch admin stats only if user is admin
      if (isAdmin) {
        const [evalResult, taskResult, approvalResult] = await Promise.all([
          supabase
            .from("evaluation_reports")
            .select("*", { count: "exact", head: true })
            .eq("status", "submitted"),
          supabase
            .from("assigned_tasks")
            .select("*", { count: "exact", head: true })
            .eq("status", "submitted"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("is_approved", false),
        ]);

        adminStats = {
          pendingEvaluations: evalResult.count || 0,
          pendingTaskReviews: taskResult.count || 0,
          pendingApprovals: approvalResult.count || 0,
        };
      }

      return {
        myActiveProjects: activeProjects || 0,
        myPendingTasks: pendingTasks || 0,
        myEvaluationStatus: evaluationStatus,
        myEvaluationScore: evaluation?.total_score ?? null,
        ...adminStats,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
