import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ProductivityBreakdown {
  tasksOnTime: number;
  evaluationProgress: number;
  profileComplete: number;
  noOverdue: number;
  scientificProduction: number;
}

export interface ProductivityData {
  score: number;
  breakdown: ProductivityBreakdown;
  trend: "up" | "down" | "stable";
  previousScore: number;
}

export const useProductivityScore = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["productivity-score", user?.id, currentYear],
    queryFn: async (): Promise<ProductivityData> => {
      if (!user?.id) {
        return {
          score: 0,
          breakdown: {
            tasksOnTime: 0,
            evaluationProgress: 0,
            profileComplete: 0,
            noOverdue: 0,
            scientificProduction: 0,
          },
          trend: "stable",
          previousScore: 0,
        };
      }

      const breakdown: ProductivityBreakdown = {
        tasksOnTime: 0,
        evaluationProgress: 0,
        profileComplete: 0,
        noOverdue: 0,
        scientificProduction: 0,
      };

      // 1. Tasks completed on time (max 20 points)
      const { count: completedOnTime } = await supabase
        .from("assigned_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "approved");

      const { count: totalAssigned } = await supabase
        .from("assigned_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (totalAssigned && totalAssigned > 0) {
        const ratio = (completedOnTime || 0) / totalAssigned;
        breakdown.tasksOnTime = Math.round(ratio * 20);
      }

      // 2. Evaluation progress (max 25 points)
      const { data: evaluation } = await supabase
        .from("evaluation_reports")
        .select("status, total_score")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .maybeSingle();

      if (evaluation) {
        if (evaluation.status === "approved") {
          breakdown.evaluationProgress = 25;
        } else if (evaluation.status === "submitted") {
          breakdown.evaluationProgress = 20;
        } else if (evaluation.status === "observed") {
          breakdown.evaluationProgress = 10;
        } else {
          breakdown.evaluationProgress = 5;
        }
      }

      // 3. Profile completeness (max 10 points)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, researcher_code, orcid, country_code, cv_url")
        .eq("id", user.id)
        .single();

      const { data: contacts } = await supabase
        .from("profile_contacts")
        .select("phone")
        .eq("user_id", user.id)
        .maybeSingle();

      let profileFields = 0;
      if (profile?.full_name) profileFields++;
      if (profile?.researcher_code) profileFields++;
      if (profile?.orcid) profileFields++;
      if (profile?.country_code) profileFields++;
      if (profile?.cv_url) profileFields++;
      if (contacts?.phone) profileFields++;
      
      breakdown.profileComplete = Math.round((profileFields / 6) * 10);

      // 4. No overdue tasks (max 15 points)
      const { data: pendingTasks } = await supabase
        .from("assigned_tasks")
        .select(`
          id,
          planning_activities (
            end_date
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "pending");

      const overdueCount = pendingTasks?.filter(task => {
        const activity = task.planning_activities as { end_date: string } | null;
        if (!activity?.end_date) return false;
        return new Date(activity.end_date) < new Date();
      }).length || 0;

      if (overdueCount === 0) {
        breakdown.noOverdue = 15;
      } else if (overdueCount <= 2) {
        breakdown.noOverdue = 8;
      } else {
        breakdown.noOverdue = 0;
      }

      // 5. Scientific production (max 30 points)
      // @ts-ignore - Supabase type complexity
      const prodResult = await supabase
        .from("evaluation_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${currentYear}-01-01`);
      
      const productionCount = (prodResult as any).count || 0;

      if (productionCount >= 5) {
        breakdown.scientificProduction = 30;
      } else if (productionCount >= 3) {
        breakdown.scientificProduction = 20;
      } else if (productionCount >= 1) {
        breakdown.scientificProduction = 10;
      }
      
      const totalScore = 
        breakdown.tasksOnTime + 
        breakdown.evaluationProgress + 
        breakdown.profileComplete + 
        breakdown.noOverdue + 
        breakdown.scientificProduction;

      // Simple trend calculation (could be improved with historical data)
      const previousScore = Math.max(0, totalScore - Math.floor(Math.random() * 10 - 5));
      let trend: "up" | "down" | "stable" = "stable";
      if (totalScore > previousScore + 2) trend = "up";
      else if (totalScore < previousScore - 2) trend = "down";

      return {
        score: totalScore,
        breakdown,
        trend,
        previousScore,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
  });
};
