import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { FileText, ClipboardCheck, User, BookOpen, AlertCircle, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  route: string;
}

export const useSmartRecommendations = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return useQuery({
    queryKey: ["smart-recommendations", user?.id, currentYear],
    queryFn: async (): Promise<Recommendation[]> => {
      if (!user?.id) return [];

      const recommendations: Recommendation[] = [];

      // Check profile completeness
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

      const missingFields: string[] = [];
      if (!profile?.full_name) missingFields.push("nombre");
      if (!profile?.researcher_code) missingFields.push("código");
      if (!profile?.orcid) missingFields.push("ORCID");
      if (!profile?.country_code) missingFields.push("país");
      if (!profile?.cv_url) missingFields.push("CV");
      if (!contacts?.phone) missingFields.push("teléfono");

      if (missingFields.length > 0) {
        recommendations.push({
          id: "profile-incomplete",
          priority: "medium",
          title: "Completa tu perfil",
          description: `Faltan: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? "..." : ""}`,
          icon: User,
          action: "Completar ahora",
          route: "/profile",
        });
      }

      // Check evaluation status
      const { data: evaluation } = await supabase
        .from("evaluation_reports")
        .select("status, total_score")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .maybeSingle();

      // If it's October or later and no evaluation started
      if (currentMonth >= 9 && !evaluation) {
        recommendations.push({
          id: "start-evaluation",
          priority: "high",
          title: "Inicia tu evaluación anual",
          description: "El período de evaluación está abierto. Registra tu producción científica.",
          icon: FileText,
          action: "Iniciar evaluación",
          route: "/evaluation",
        });
      } else if (evaluation?.status === "draft") {
        recommendations.push({
          id: "complete-evaluation",
          priority: "high",
          title: "Completa tu evaluación",
          description: "Tu evaluación está en borrador. Envíala para revisión.",
          icon: FileText,
          action: "Continuar evaluación",
          route: "/evaluation",
        });
      } else if (evaluation?.status === "observed") {
        recommendations.push({
          id: "fix-evaluation",
          priority: "high",
          title: "Corrige observaciones",
          description: "Tu evaluación tiene observaciones del administrador.",
          icon: AlertCircle,
          action: "Ver observaciones",
          route: "/evaluation",
        });
      }

      // Check overdue tasks - need to join with planning_activities to check end_date
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

      if (overdueCount > 0) {
        recommendations.push({
          id: "overdue-tasks",
          priority: "high",
          title: `${overdueCount} tarea${overdueCount > 1 ? "s" : ""} vencida${overdueCount > 1 ? "s" : ""}`,
          description: "Tienes actividades con fecha límite pasada.",
          icon: AlertCircle,
          action: "Ver tareas",
          route: "/my-tasks",
        });
      }

      // Check observed tasks
      const { count: observedCount } = await supabase
        .from("assigned_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "observado");

      if (observedCount && observedCount > 0) {
        recommendations.push({
          id: "observed-tasks",
          priority: "high",
          title: `${observedCount} tarea${observedCount > 1 ? "s" : ""} observada${observedCount > 1 ? "s" : ""}`,
          description: "Corrige las observaciones del administrador.",
          icon: ClipboardCheck,
          action: "Corregir",
          route: "/my-tasks",
        });
      }

      // Check scientific production
      const prodQuery: any = supabase.from("evaluation_items");
      const productionResult = await prodQuery
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${currentYear}-01-01`);
      const productionCount = productionResult?.count || 0;

      if (!productionCount || productionCount === 0) {
        recommendations.push({
          id: "no-production",
          priority: "medium",
          title: "Registra producción científica",
          description: "No tienes publicaciones registradas este año.",
          icon: BookOpen,
          action: "Ver proyectos",
          route: "/user/official-projects",
        });
      }

      // Check upcoming deadlines (tasks due within 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const todayDate = new Date();
      
      // @ts-ignore - Supabase type complexity
      const urgentCount = (pendingTasks || []).filter((task: any) => {
        const activity = task.planning_activities;
        if (!activity?.end_date) return false;
        const endDate = new Date(activity.end_date);
        return endDate >= todayDate && endDate <= threeDaysFromNow;
      }).length || 0;

      if (urgentCount > 0) {
        recommendations.push({
          id: "urgent-deadlines",
          priority: "medium",
          title: `${urgentCount} tarea${urgentCount > 1 ? "s" : ""} por vencer`,
          description: "Tienes actividades que vencen en los próximos 3 días.",
          icon: Calendar,
          action: "Ver tareas",
          route: "/my-tasks",
        });
      }

      // Sort by priority
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const sorted = [...recommendations].sort((a, b) => 
        (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
      );
      return sorted.slice(0, 4);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};
