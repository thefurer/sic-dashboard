import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
      <div className="metric-tile">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="metric-tile">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-glow-container !w-10 !h-10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Recomendaciones Inteligentes
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground">
            ¡Excelente! No tienes acciones pendientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="metric-tile"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-glow-container !w-10 !h-10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recomendaciones Inteligentes
          </h3>
          <p className="text-xs text-muted-foreground">
            Acciones sugeridas basadas en tu actividad
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-md cursor-pointer group",
                priorityColors[rec.priority]
              )}
              onClick={() => navigate(rec.route)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  priorityBadgeColors[rec.priority]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {rec.title}
                    </h4>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0",
                      priorityBadgeColors[rec.priority]
                    )}>
                      {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Media" : "Baja"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {rec.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3"
                >
                  <span className="text-xs mr-1">{rec.action}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
