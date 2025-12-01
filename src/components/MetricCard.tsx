import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-white/40 dark:border-slate-700/50 rounded-[30px] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardContent className="p-8 relative">
        {/* Colored Glow Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-5xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={`text-sm font-semibold ${trend.isPositive ? "text-primary" : "text-accent"}`}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/20 dark:bg-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
