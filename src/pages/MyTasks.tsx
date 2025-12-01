import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TaskEvidenceModal } from "@/components/tasks/TaskEvidenceModal";
import { Upload, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function MyTasks() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user's assigned tasks
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select(`
          *,
          planning_activities!inner(
            activity,
            objective,
            start_date,
            end_date,
            verification_means
          )
        `)
        .eq("user_id", user.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleUploadEvidence = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">⏳ Pendiente</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500">📤 Enviado</Badge>;
      case "approved":
        return <Badge className="bg-green-500">✓ Aprobado</Badge>;
      case "observado":
        return <Badge variant="destructive">⚠ Requiere Corrección</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8">Cargando tus actividades...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mis Actividades Asignadas</h1>
        <p className="text-muted-foreground mt-2">
          Revisa las actividades que te han sido asignadas y sube tus evidencias de cumplimiento
        </p>
      </div>

      {tasks && tasks.length > 0 ? (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{task.planning_activities.activity}</CardTitle>
                    <CardDescription className="mt-2">
                      {task.planning_activities.objective}
                    </CardDescription>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Fecha Inicio:</span>{" "}
                    {format(new Date(task.planning_activities.start_date), "dd/MM/yyyy", { locale: es })}
                  </div>
                  <div>
                    <span className="font-medium">Fecha Fin:</span>{" "}
                    {format(new Date(task.planning_activities.end_date), "dd/MM/yyyy", { locale: es })}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Medios de Verificación:</span>{" "}
                    {task.planning_activities.verification_means}
                  </div>
                </div>

                {task.status === "observado" && task.admin_observations && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Observaciones del Administrador:</strong>
                      <p className="mt-1">{task.admin_observations}</p>
                    </AlertDescription>
                  </Alert>
                )}

                {task.evidence_description && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">Descripción de Evidencia:</p>
                    <p className="text-sm">{task.evidence_description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {(task.status === "pending" || task.status === "observado") && (
                    <Button onClick={() => handleUploadEvidence(task)}>
                      <Upload className="mr-2 h-4 w-4" />
                      {task.evidence_url ? "Actualizar Evidencia" : "Subir Evidencia"}
                    </Button>
                  )}
                  
                  {task.evidence_url && (
                    <Button variant="outline" asChild>
                      <a href={task.evidence_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Archivo
                      </a>
                    </Button>
                  )}
                  
                  {task.evidence_link && (
                    <Button variant="outline" asChild>
                      <a href={task.evidence_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Enlace
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tienes actividades asignadas</p>
          </CardContent>
        </Card>
      )}

      <TaskEvidenceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={selectedTask}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
