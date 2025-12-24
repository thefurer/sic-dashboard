import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TaskEvidenceModal } from "@/components/tasks/TaskEvidenceModal";
import { Upload, FileText, ExternalLink, AlertCircle, Clock, AlertTriangle, Users, Target, Calendar } from "lucide-react";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function MyTasks() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUrgentAlert, setShowUrgentAlert] = useState(true);

  // Fetch user's assigned tasks with activity and plan details
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select(`
          *,
          planning_activities!inner(
            id,
            activity,
            objective,
            start_date,
            end_date,
            verification_means,
            responsibles,
            plan_id
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
        return <Badge className="bg-blue-500 hover:bg-blue-600">📤 Enviado</Badge>;
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">✓ Aprobado</Badge>;
      case "observado":
        return <Badge variant="destructive">⚠ Requiere Corrección</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDeadlineStatus = (endDate: string, status: string) => {
    if (status === "approved") return null;
    
    const end = new Date(endDate);
    const daysLeft = differenceInDays(end, new Date());
    
    if (isPast(end) && !isToday(end)) {
      return {
        type: "overdue",
        message: "¡Plazo vencido!",
        daysText: `Venció hace ${Math.abs(daysLeft)} días`,
        className: "bg-destructive text-destructive-foreground",
      };
    } else if (daysLeft <= 3 && daysLeft >= 0) {
      return {
        type: "urgent",
        message: "¡Urgente!",
        daysText: daysLeft === 0 ? "Vence hoy" : `Vence en ${daysLeft} días`,
        className: "bg-orange-500 text-white",
      };
    } else if (daysLeft <= 7) {
      return {
        type: "warning",
        message: "Próximo a vencer",
        daysText: `Vence en ${daysLeft} días`,
        className: "bg-yellow-500 text-black",
      };
    }
    return null;
  };

  // Get urgent/overdue tasks
  const urgentTasks = tasks?.filter(task => {
    if (task.status === "approved") return false;
    const deadlineStatus = getDeadlineStatus(task.planning_activities.end_date, task.status);
    return deadlineStatus?.type === "overdue" || deadlineStatus?.type === "urgent";
  }) || [];

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

      {/* Urgent Alert Banner */}
      <AnimatePresence>
        {showUrgentAlert && urgentTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg font-bold flex items-center gap-2">
                ⚠️ ¡Atención! Tienes {urgentTasks.length} actividad{urgentTasks.length > 1 ? "es" : ""} urgente{urgentTasks.length > 1 ? "s" : ""}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="list-disc list-inside space-y-1">
                  {urgentTasks.slice(0, 3).map(task => {
                    const deadlineStatus = getDeadlineStatus(task.planning_activities.end_date, task.status);
                    return (
                      <li key={task.id} className="text-sm">
                        <strong>{task.planning_activities.activity}</strong> - {deadlineStatus?.daysText}
                      </li>
                    );
                  })}
                  {urgentTasks.length > 3 && (
                    <li className="text-sm">Y {urgentTasks.length - 3} más...</li>
                  )}
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setShowUrgentAlert(false)}
                >
                  Entendido
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {tasks && tasks.length > 0 ? (
        <div className="grid gap-6">
          {tasks.map((task) => {
            const deadlineStatus = getDeadlineStatus(task.planning_activities.end_date, task.status);
            const responsibles = task.planning_activities.responsibles || [];
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={deadlineStatus?.type === "overdue" ? "ring-2 ring-destructive rounded-lg" : ""}
              >
                <Card className={deadlineStatus?.type === "overdue" ? "border-destructive" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {deadlineStatus && (
                            <Badge className={deadlineStatus.className}>
                              {deadlineStatus.type === "overdue" ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                              {deadlineStatus.message}
                            </Badge>
                          )}
                          {getStatusBadge(task.status)}
                        </div>
                        <CardTitle className="text-xl">{task.planning_activities.activity}</CardTitle>
                        <CardDescription className="mt-2 flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{task.planning_activities.objective}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dates and Details Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha Inicio</p>
                          <p className="font-medium">
                            {format(new Date(task.planning_activities.start_date), "dd 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha Fin</p>
                          <p className={`font-medium ${deadlineStatus?.type === "overdue" ? "text-destructive" : ""}`}>
                            {format(new Date(task.planning_activities.end_date), "dd 'de' MMMM, yyyy", { locale: es })}
                            {deadlineStatus && (
                              <span className={`ml-2 text-xs ${deadlineStatus.type === "overdue" ? "text-destructive" : "text-orange-500"}`}>
                                ({deadlineStatus.daysText})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 md:col-span-2 lg:col-span-1">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Medio de Verificación</p>
                          <p className="font-medium">{task.planning_activities.verification_means}</p>
                        </div>
                      </div>
                    </div>

                    {/* Responsibles */}
                    {Array.isArray(responsibles) && responsibles.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Responsables:</p>
                          <div className="flex flex-wrap gap-2">
                            {responsibles.map((name: unknown, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {String(name)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Observations */}
                    {task.status === "observado" && task.admin_observations && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Observaciones del Administrador:</strong>
                          <p className="mt-1">{task.admin_observations}</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Evidence Description */}
                    {task.evidence_description && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Tu descripción de Evidencia:</p>
                        <p className="text-sm">{task.evidence_description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      {(task.status === "pending" || task.status === "observado") && (
                        <Button 
                          onClick={() => handleUploadEvidence(task)}
                          className={deadlineStatus?.type === "overdue" ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
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
              </motion.div>
            );
          })}
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
