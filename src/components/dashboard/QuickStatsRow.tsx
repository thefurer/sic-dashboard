import { motion } from "framer-motion";
import { FolderOpen, ListTodo, Award, FileSearch } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface QuickStatsRowProps {
  stats: DashboardStats;
  isAdmin: boolean;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  suffix?: string;
}

export const QuickStatsRow = ({ stats, isAdmin, isLoading }: QuickStatsRowProps) => {
  const userStats: StatItem[] = [
    {
      label: "Proyectos Activos",
      value: stats.myActiveProjects,
      icon: FolderOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Tareas Pendientes",
      value: stats.myPendingTasks,
      icon: ListTodo,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Puntaje Evaluación",
      value: stats.myEvaluationScore ?? "—",
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
      suffix: stats.myEvaluationScore !== null ? " pts" : "",
    },
  ];

  const adminExtraStats: StatItem[] = isAdmin
    ? [
        {
          label: "Revisiones Pendientes",
          value: stats.pendingEvaluations + stats.pendingTaskReviews,
          icon: FileSearch,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
      ]
    : [];

  const allStats = [...userStats, ...adminExtraStats];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].slice(0, isAdmin ? 4 : 3).map((i) => (
          <div key={i} className="metric-tile !p-4">
            <div className="h-10 w-10 bg-muted animate-pulse rounded-xl mb-3" />
            <div className="h-6 w-16 bg-muted animate-pulse rounded mb-1" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {allStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="metric-tile !p-4 group hover:border-primary/30 transition-colors"
          >
            <div className={`p-2.5 rounded-xl ${stat.bgColor} w-fit mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
