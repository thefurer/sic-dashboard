import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductivityScore } from "@/hooks/useProductivityScore";
import { TrendingUp, TrendingDown, Minus, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-destructive";
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return "from-success/20 to-success/5";
  if (score >= 60) return "from-primary/20 to-primary/5";
  if (score >= 40) return "from-warning/20 to-warning/5";
  return "from-destructive/20 to-destructive/5";
};

const getScoreStroke = (score: number) => {
  if (score >= 80) return "stroke-success";
  if (score >= 60) return "stroke-primary";
  if (score >= 40) return "stroke-warning";
  return "stroke-destructive";
};

const breakdownLabels = {
  tasksOnTime: { label: "Tareas a tiempo", max: 20 },
  evaluationProgress: { label: "Evaluación", max: 25 },
  profileComplete: { label: "Perfil completo", max: 10 },
  noOverdue: { label: "Sin atrasos", max: 15 },
  scientificProduction: { label: "Producción", max: 30 },
};

export const ProductivityScore = () => {
  const { data, isLoading } = useProductivityScore();

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    );
  }

  const { score, breakdown, trend, previousScore } = data;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  
  // SVG circle calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r border",
          getScoreGradient(score),
          score >= 80 ? "border-success/20" : score >= 60 ? "border-primary/20" : score >= 40 ? "border-warning/20" : "border-destructive/20"
        )}
      >
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              className="stroke-muted"
              strokeWidth="6"
            />
            <motion.circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              className={getScoreStroke(score)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-bold", getScoreColor(score))}>
              {score}
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Zap className={cn("h-4 w-4", getScoreColor(score))} />
            <span className="text-sm font-semibold text-foreground">
              Índice de Productividad
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium mb-2">Desglose del puntaje:</p>
                <ul className="space-y-1 text-xs">
                  {Object.entries(breakdown).map(([key, value]) => {
                    const config = breakdownLabels[key as keyof typeof breakdownLabels];
                    return (
                      <li key={key} className="flex justify-between">
                        <span>{config.label}</span>
                        <span className="font-medium">{value}/{config.max}</span>
                      </li>
                    );
                  })}
                </ul>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <TrendIcon className={cn("h-4 w-4", trendColor)} />
            <span className={cn("text-xs", trendColor)}>
              {trend === "up" && `+${score - previousScore} pts`}
              {trend === "down" && `${score - previousScore} pts`}
              {trend === "stable" && "Sin cambios"}
            </span>
            <span className="text-xs text-muted-foreground">vs. anterior</span>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
