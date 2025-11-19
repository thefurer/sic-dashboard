import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { FolderKanban, BookOpen, Users, Clock, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function Dashboard() {
  const { data, isLoading } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
        </p>
      </div>

      {/* Bento Grid Layout - Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module A - Large Line Chart (66% width on desktop) */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Proyectos / Inversión en el Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.productionOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-muted-foreground"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    className="text-muted-foreground"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="articles"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Artículos"
                  />
                  <Line
                    type="monotone"
                    dataKey="books"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Libros"
                  />
                  <Line
                    type="monotone"
                    dataKey="conferences"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Conferencias"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Module B - Donut Chart (33% width on desktop) */}
        <Card className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Tipos de Investigación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data?.projectsByType || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(data?.projectsByType || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Projects */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Proyectos Activos</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{data?.activeProjects || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Articles Indexed */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Artículos Indexados</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{data?.articlesIndexed || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Beneficiaries */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Beneficiarios Totales</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {data?.totalBeneficiaries.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pending Approvals */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aprobaciones Pendientes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{data?.pendingApprovals || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
