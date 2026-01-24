import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmartRecommendations } from "@/hooks/useSmartRecommendations";
import { Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityColors = {
  high: "border-l-destructive bg-destructive/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-primary bg-primary/5",
};

const priorityBadgeColors = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-primary/10 text-primary",
};

export const SmartRecommendations = () => {
  const navigate = useNavigate();
  const { data: recommendations, isLoading } = useSmartRecommendations();

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

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="metric-tile !p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="icon-glow-container !w-8 !h-8">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Recomendaciones
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">
            ¡Excelente! No tienes acciones pendientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="metric-tile !p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="icon-glow-container !w-8 !h-8">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Recomendaciones
        </h3>
      </div>

      <div className="space-y-2">
        {recommendations.slice(0, 3).map((rec, index) => {
          const Icon = rec.icon;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-lg border-l-3 transition-all duration-200 hover:shadow-sm cursor-pointer group",
                priorityColors[rec.priority]
              )}
              onClick={() => navigate(rec.route)}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                  priorityBadgeColors[rec.priority]
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-xs truncate">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {rec.description}
                  </p>
                </div>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                  priorityBadgeColors[rec.priority]
                )}>
                  {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
