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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module A - Large Line Chart (60% width on desktop) */}
        <Card className="lg:col-span-7 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Producción Científica en el Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Module B - Donut Chart (40% width on desktop) */}
        <Card className="lg:col-span-5 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Proyectos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Module C - Impact Score Card (Full width on mobile, right side on desktop) */}
        <Card className="lg:col-span-12 hover:shadow-md transition-all bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Puntuación de Impacto Total
                </p>
                {isLoading ? (
                  <Skeleton className="h-12 w-32" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold">{data?.totalImpactScore || 0}%</p>
                    <span
                      className={`text-sm font-medium flex items-center gap-1 ${
                        (data?.impactTrend || 0) >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      {data?.impactTrend || 0}%
                    </span>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Projects */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Proyectos Activos</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{data?.activeProjects || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Articles Indexed */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Artículos Indexados</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{data?.articlesIndexed || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Beneficiaries */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Beneficiarios Totales</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">
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
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Aprobaciones Pendientes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{data?.pendingApprovals || 0}</p>
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
