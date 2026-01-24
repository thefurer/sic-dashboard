import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriorityTasks } from "@/hooks/usePriorityTasks";
import { ListTodo, Clock, AlertTriangle, Eye, CalendarClock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const priorityConfig = {
  overdue: {
    label: "Vencida",
    icon: AlertTriangle,
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    textClass: "text-destructive",
  },
  observed: {
    label: "Observada",
    icon: Eye,
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    textClass: "text-warning",
  },
  today: {
    label: "Hoy",
    icon: Clock,
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    textClass: "text-orange-600",
  },
  urgent: {
    label: "Urgente",
    icon: CalendarClock,
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    textClass: "text-amber-600",
  },
  upcoming: {
    label: "Próxima",
    icon: CalendarClock,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    textClass: "text-primary",
  },
};

export const PriorityTaskQueue = () => {
  const navigate = useNavigate();
  const { data: tasks, isLoading } = usePriorityTasks(4);

  if (isLoading) {
    return (
      <div className="metric-tile !p-4">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="metric-tile !p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="icon-glow-container !w-8 !h-8">
            <ListTodo className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Cola de Prioridad
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
            <ListTodo className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">
            No tienes tareas pendientes
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="metric-tile !p-4 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="icon-glow-container !w-8 !h-8">
            <ListTodo className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Cola de Prioridad
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/my-tasks")}
          className="text-primary hover:text-primary/80 h-7 text-xs px-2"
        >
          Ver todas
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-1.5 flex-1">
        {tasks.map((task, index) => {
          const config = priorityConfig[task.priority];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate("/my-tasks")}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group border border-transparent hover:border-border"
            >
              <div className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                config.badgeClass
              )}>
                <Icon className="h-3 w-3" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {task.activity}
                </p>
                <span className={cn("text-[10px]", config.textClass)}>
                  {task.daysRemaining < 0
                    ? `${Math.abs(task.daysRemaining)}d vencida`
                    : task.daysRemaining === 0
                    ? "Hoy"
                    : `${task.daysRemaining}d`}
                </span>
              </div>

              <Badge variant="outline" className={cn("shrink-0 text-[9px] px-1.5 py-0", config.badgeClass)}>
                {config.label}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
