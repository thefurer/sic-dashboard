import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  ClipboardList,
  UserCheck,
  FileSearch
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/hooks/useDashboardStats";

interface UserStatusPanelProps {
  stats: DashboardStats;
  isAdmin: boolean;
  isLoading: boolean;
}

const getEvaluationStatusConfig = (status: DashboardStats['myEvaluationStatus']) => {
  switch (status) {
    case 'approved':
      return {
        label: "Aprobada",
        icon: CheckCircle2,
        variant: "default" as const,
        className: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
      };
    case 'submitted':
      return {
        label: "Enviada",
        icon: Send,
        variant: "secondary" as const,
        className: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
      };
    case 'observed':
      return {
        label: "Observada",
        icon: AlertCircle,
        variant: "destructive" as const,
        className: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
      };
    case 'draft':
      return {
        label: "En Progreso",
        icon: Clock,
        variant: "outline" as const,
        className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      };
    default:
      return {
        label: "Sin Iniciar",
        icon: FileText,
        variant: "outline" as const,
        className: "bg-muted text-muted-foreground border-border",
      };
  }
};

export const UserStatusPanel = ({ stats, isAdmin, isLoading }: UserStatusPanelProps) => {
  const evalConfig = getEvaluationStatusConfig(stats.myEvaluationStatus);
  const EvalIcon = evalConfig.icon;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="metric-tile !p-5 space-y-4"
      >
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          <div className="h-12 bg-muted animate-pulse rounded-xl" />
          <div className="h-12 bg-muted animate-pulse rounded-xl" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="metric-tile !p-5 space-y-4"
    >
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        Mi Estado
      </h3>

      {/* Evaluation Status */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Evaluación {new Date().getFullYear()}</span>
          <Badge className={`${evalConfig.className} border`}>
            <EvalIcon className="h-3 w-3 mr-1" />
            {evalConfig.label}
          </Badge>
        </div>
        
        {stats.myEvaluationScore !== null && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Puntaje</span>
            <span className="text-lg font-bold text-primary">{stats.myEvaluationScore} pts</span>
          </div>
        )}

        {stats.myEvaluationStatus === 'observed' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-orange-600 dark:text-orange-400">Requiere correcciones</span>
          </div>
        )}
      </div>

      {/* Tasks Status */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tareas Pendientes</span>
          <span className="text-lg font-bold text-foreground">{stats.myPendingTasks}</span>
        </div>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Panel Admin</h4>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                <span className="text-sm">Evaluaciones por revisar</span>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {stats.pendingEvaluations}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tareas por revisar</span>
              </div>
              <Badge variant="outline">{stats.pendingTaskReviews}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Solicitudes pendientes</span>
              </div>
              <Badge variant="outline">{stats.pendingApprovals}</Badge>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
