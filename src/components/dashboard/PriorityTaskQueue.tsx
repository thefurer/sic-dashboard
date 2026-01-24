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
  const { data: tasks, isLoading } = usePriorityTasks(5);

  if (isLoading) {
    return (
      <div className="metric-tile h-full">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="metric-tile h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-glow-container !w-10 !h-10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Cola de Prioridad
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <ListTodo className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground">
            No tienes tareas pendientes
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="metric-tile h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-glow-container !w-10 !h-10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Cola de Prioridad
            </h3>
            <p className="text-xs text-muted-foreground">
              Tus tareas más urgentes
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/my-tasks")}
          className="text-primary hover:text-primary/80"
        >
          Ver todas
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-2 flex-1">
        {tasks.map((task, index) => {
          const config = priorityConfig[task.priority];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate("/my-tasks")}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group border border-transparent hover:border-border"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                config.badgeClass
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {task.activity}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(task.end_date), "d MMM", { locale: es })}
                  </span>
                  <span className={cn("text-xs font-medium", config.textClass)}>
                    {task.daysRemaining < 0
                      ? `${Math.abs(task.daysRemaining)}d vencida`
                      : task.daysRemaining === 0
                      ? "Vence hoy"
                      : `${task.daysRemaining}d restantes`}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className={cn("shrink-0 text-[10px]", config.badgeClass)}>
                {config.label}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
