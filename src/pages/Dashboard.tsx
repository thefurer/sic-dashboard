import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, BookOpen, GraduationCap, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const productionData = [
  { year: "2020", articles: 12, books: 2, conferences: 8 },
  { year: "2021", articles: 18, books: 3, conferences: 12 },
  { year: "2022", articles: 24, books: 4, conferences: 15 },
  { year: "2023", articles: 31, books: 5, conferences: 20 },
  { year: "2024", articles: 38, books: 7, conferences: 23 },
];

const recentActivity = [
  { title: "Proyecto 'IA en Salud' actualizado", date: "Hace 2 horas", type: "project" },
  { title: "Nuevo artículo publicado en Scopus", date: "Hace 5 horas", type: "publication" },
  { title: "Convocatoria SENESCYT enviada", date: "Hace 1 día", type: "funding" },
  { title: "Reunión de equipo completada", date: "Hace 2 días", type: "meeting" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Proyectos Activos"
          value={12}
          icon={FolderKanban}
          trend={{ value: "+3 este mes", isPositive: true }}
        />
        <MetricCard
          title="Artículos Publicados"
          value={38}
          icon={BookOpen}
          trend={{ value: "+7 este año", isPositive: true }}
        />
        <MetricCard
          title="Libros Publicados"
          value={7}
          icon={GraduationCap}
          trend={{ value: "+2 este año", isPositive: true }}
        />
        <MetricCard
          title="Beneficiarios Totales"
          value="2,450"
          icon={Users}
          trend={{ value: "+450 este año", isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Producción Científica por Año</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="articles" name="Artículos" fill="hsl(var(--chart-1))" />
                <Bar dataKey="books" name="Libros" fill="hsl(var(--chart-2))" />
                <Bar dataKey="conferences" name="Conferencias" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
