import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface MonthlyData {
  month: string;
  evaluations: number;
  tasks: number;
}

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export const MonthlyProgressChart = () => {
  const currentYear = new Date().getFullYear();

  const { data: evaluationData } = useQuery({
    queryKey: ["monthly-evaluations", currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_reports")
        .select("submitted_at, status")
        .gte("submitted_at", `${currentYear}-01-01`)
        .lte("submitted_at", `${currentYear}-12-31`)
        .not("submitted_at", "is", null);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: taskData } = useQuery({
    queryKey: ["monthly-tasks", currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select("submitted_at, reviewed_at, status")
        .or(`submitted_at.gte.${currentYear}-01-01,reviewed_at.gte.${currentYear}-01-01`);

      if (error) throw error;
      return data || [];
    },
  });

  const chartData = useMemo(() => {
    const monthlyStats: MonthlyData[] = MONTHS_ES.map((month) => ({
      month,
      evaluations: 0,
      tasks: 0,
    }));

    // Count evaluations by month
    evaluationData?.forEach((eval_) => {
      if (eval_.submitted_at) {
        const date = new Date(eval_.submitted_at);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyStats[monthIndex].evaluations += 1;
        }
      }
    });

    // Count completed/approved tasks by month
    taskData?.forEach((task) => {
      const dateToUse = task.reviewed_at || task.submitted_at;
      if (dateToUse && (task.status === "approved" || task.status === "submitted")) {
        const date = new Date(dateToUse);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyStats[monthIndex].tasks += 1;
        }
      }
    });

    return monthlyStats;
  }, [evaluationData, taskData]);

  const totalEvaluations = chartData.reduce((acc, curr) => acc + curr.evaluations, 0);
  const totalTasks = chartData.reduce((acc, curr) => acc + curr.tasks, 0);

  const chartConfig = {
    evaluations: {
      label: "Evaluaciones",
      color: "hsl(var(--primary))",
    },
    tasks: {
      label: "Tareas",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="metric-tile !p-6 col-span-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="icon-glow-container !w-10 !h-10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Progreso Mensual {currentYear}
            </h3>
            <p className="text-sm text-muted-foreground">
              Evaluaciones enviadas y tareas completadas
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-medium text-foreground">
              {totalEvaluations} Evaluaciones
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-chart-2/10 border border-chart-2/20">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span className="text-sm font-medium text-foreground">
              {totalTasks} Tareas
            </span>
          </div>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEvaluations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="evaluations"
              name="Evaluaciones"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEvaluations)"
            />
            <Area
              type="monotone"
              dataKey="tasks"
              name="Tareas"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTasks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {totalEvaluations === 0 && totalTasks === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              Los datos aparecerán aquí conforme se registre actividad
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
