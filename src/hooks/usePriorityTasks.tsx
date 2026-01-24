import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PriorityTask {
  id: string;
  activity: string;
  end_date: string;
  status: string;
  priority: "overdue" | "observed" | "today" | "urgent" | "upcoming";
  daysRemaining: number;
  activity_id: string;
}

export const usePriorityTasks = (limit: number = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["priority-tasks", user?.id, limit],
    queryFn: async (): Promise<PriorityTask[]> => {
      if (!user?.id) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch pending and observed tasks with activity details
      const { data: tasks, error } = await supabase
        .from("assigned_tasks")
        .select(`
          id,
          status,
          activity_id,
          planning_activities (
            activity,
            end_date
          )
        `)
        .eq("user_id", user.id)
        .in("status", ["pending", "observado"])
        .limit(20);

      if (error || !tasks) return [];

      const prioritizedTasks: PriorityTask[] = tasks
        .filter(task => task.planning_activities)
        .map((task) => {
          const activity = task.planning_activities as { activity: string; end_date: string };
          const endDate = new Date(activity.end_date);
          endDate.setHours(0, 0, 0, 0);
          const diffTime = endDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let priority: PriorityTask["priority"];
          
          if (task.status === "observado") {
            priority = "observed";
          } else if (daysRemaining < 0) {
            priority = "overdue";
          } else if (daysRemaining === 0) {
            priority = "today";
          } else if (daysRemaining <= 3) {
            priority = "urgent";
          } else {
            priority = "upcoming";
          }

          return {
            id: task.id,
            activity: activity.activity || "Actividad sin nombre",
            end_date: activity.end_date,
            status: task.status,
            priority,
            daysRemaining,
            activity_id: task.activity_id,
          };
        });

      // Sort by priority order
      const priorityOrder = {
        overdue: 0,
        observed: 1,
        today: 2,
        urgent: 3,
        upcoming: 4,
      };

      return prioritizedTasks
        .sort((a, b) => {
          const orderDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (orderDiff !== 0) return orderDiff;
          return a.daysRemaining - b.daysRemaining;
        })
        .slice(0, limit);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
};
