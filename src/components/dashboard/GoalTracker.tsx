import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Star, 
  Clock, 
  FileCheck, 
  User, 
  BookOpen,
  Users,
  Award
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  checkFn: (userId: string) => Promise<{ unlocked: boolean; progress?: number; maxProgress?: number }>;
}

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "first-evaluation",
    name: "Primera Evaluación",
    description: "Completar tu primera evaluación anual",
    icon: FileCheck,
    checkFn: async (userId: string) => {
      const { count } = await supabase
        .from("evaluation_reports")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["submitted", "approved"]);
      return { unlocked: (count || 0) > 0 };
    },
  },
  {
    id: "punctual",
    name: "Puntual",
    description: "Completar 5 tareas antes de la fecha límite",
    icon: Clock,
    checkFn: async (userId: string) => {
      const { count } = await supabase
        .from("assigned_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "approved");
      const progress = count || 0;
      return { unlocked: progress >= 5, progress: Math.min(progress, 5), maxProgress: 5 };
    },
  },
  {
    id: "profile-complete",
    name: "Perfil Completo",
    description: "Completar todos los campos del perfil",
    icon: User,
    checkFn: async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, researcher_code, orcid, country_code, cv_url")
        .eq("id", userId)
        .single();
      const { data: contacts } = await supabase
        .from("profile_contacts")
        .select("phone")
        .eq("user_id", userId)
        .maybeSingle();
      
      let count = 0;
      if (profile?.full_name) count++;
      if (profile?.researcher_code) count++;
      if (profile?.orcid) count++;
      if (profile?.country_code) count++;
      if (profile?.cv_url) count++;
      if (contacts?.phone) count++;
      
      return { unlocked: count >= 6, progress: count, maxProgress: 6 };
    },
  },
  {
    id: "publisher",
    name: "Publicador",
    description: "Registrar tu primera publicación científica",
    icon: BookOpen,
    checkFn: async (userId: string) => {
      const { count } = await supabase
        .from("evaluation_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("category", "publicacion");
      return { unlocked: (count || 0) > 0 };
    },
  },
  {
    id: "collaborator",
    name: "Colaborador",
    description: "Participar en un proyecto de investigación",
    icon: Users,
    checkFn: async (userId: string) => {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("investigator_id", userId);
      return { unlocked: (count || 0) > 0 };
    },
  },
  {
    id: "star-researcher",
    name: "Investigador Estrella",
    description: "Obtener más de 80 puntos en la evaluación",
    icon: Star,
    checkFn: async (userId: string) => {
      const currentYear = new Date().getFullYear();
      const { data: evaluation } = await supabase
        .from("evaluation_reports")
        .select("total_score")
        .eq("user_id", userId)
        .eq("year", currentYear)
        .eq("status", "approved")
        .maybeSingle();
      return { unlocked: (evaluation?.total_score || 0) > 80 };
    },
  },
];

export const GoalTracker = () => {
  const { user } = useAuth();

  // @ts-ignore - Complex type inference
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const results: Achievement[] = [];
      
      for (const def of achievementDefinitions) {
        const result = await def.checkFn(user.id);
        results.push({
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          unlocked: result.unlocked,
          progress: result.progress,
          maxProgress: result.maxProgress,
        });
      }

      return results;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  const unlockedCount = achievements?.filter((a) => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Logros</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {unlockedCount}/{totalCount}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {achievements?.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative w-10 h-10 rounded-full flex items-center justify-center cursor-help transition-all",
                      achievement.unlocked
                        ? "bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30"
                        : "bg-muted border border-border"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        achievement.unlocked ? "text-primary-foreground" : "text-muted-foreground/50"
                      )}
                    />
                    {achievement.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center"
                      >
                        <Award className="h-2.5 w-2.5 text-success-foreground" />
                      </motion.div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.progress !== undefined && !achievement.unlocked && (
                    <p className="text-xs text-primary mt-1">
                      Progreso: {achievement.progress}/{achievement.maxProgress}
                    </p>
                  )}
                  {achievement.unlocked && (
                    <p className="text-xs text-success mt-1">✓ Desbloqueado</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
