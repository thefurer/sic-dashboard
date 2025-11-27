import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Planning() {
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["planning-sheets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planning_sheets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planificación Estratégica</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la planificación operativa del grupo de investigación
          </p>
        </div>
        <Button onClick={() => navigate("/admin/planning/new")} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nueva Planificación
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/planning/${plan.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === "draft" 
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}>
                    {plan.status === "draft" ? "Borrador" : "Finalizado"}
                  </span>
                </div>
                <CardTitle className="mt-4">{plan.period_name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(plan.created_at), "PPP", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Presidente:</strong> {plan.president_name}
                  </p>
                  <p>
                    <strong>Reuniones:</strong> {plan.meeting_schedule}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay planificaciones</h3>
            <p className="text-muted-foreground mb-6">
              Comienza creando tu primera planificación estratégica
            </p>
            <Button onClick={() => navigate("/admin/planning/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Planificación
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
