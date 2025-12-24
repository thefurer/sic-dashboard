import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, ExternalLink, Download, Bell, AlertTriangle, Clock, Send, Users } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { drawPDFHeader } from "@/lib/pdfHeaderUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TaskReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [observations, setObservations] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedTasksForAlert, setSelectedTasksForAlert] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("submitted");

  // Fetch all tasks with different statuses
  const { data: allTasks, isLoading } = useQuery({
    queryKey: ["all-assigned-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select(`
          *,
          planning_activities!inner(activity, objective, start_date, end_date, plan_id, responsibles, verification_means)
        `)
        .order("created_at", { ascending: false });

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        // Map profiles to tasks
        const tasksWithProfiles = data.map(task => ({
          ...task,
          user_profile: profilesData?.find(p => p.id === task.user_id) || { full_name: "Usuario desconocido", email: "" }
        }));

        return tasksWithProfiles;
      }

      if (error) throw error;
      return [];
    },
  });

  // Filter tasks by status
  const submittedTasks = allTasks?.filter(t => t.status === "submitted") || [];
  const reviewedTasks = allTasks?.filter(t => t.status === "approved" || t.status === "observado") || [];
  const pendingTasks = allTasks?.filter(t => t.status === "pending") || [];

  // Find tasks that are overdue or close to deadline
  const urgentPendingTasks = pendingTasks.filter(task => {
    const endDate = new Date(task.planning_activities.end_date);
    const daysLeft = differenceInDays(endDate, new Date());
    return isPast(endDate) || daysLeft <= 7;
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ taskId, status, obs }: { taskId: string; status: string; obs?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("assigned_tasks")
        .update({
          status,
          admin_observations: obs || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assigned-tasks"] });
      toast({
        title: "Revisión guardada",
        description: "El estado de la tarea ha sido actualizado",
      });
      setIsReviewDialogOpen(false);
      setSelectedTask(null);
      setObservations("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send alert mutation
  const sendAlertMutation = useMutation({
    mutationFn: async ({ taskIds, message }: { taskIds: string[]; message: string }) => {
      // Update tasks with admin observations as an alert/reminder
      const { error } = await supabase
        .from("assigned_tasks")
        .update({
          admin_observations: `[ALERTA ${format(new Date(), "dd/MM/yyyy")}]: ${message}`,
        })
        .in("id", taskIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assigned-tasks"] });
      toast({
        title: "Alertas enviadas",
        description: `Se enviaron alertas a ${selectedTasksForAlert.length} usuario(s)`,
      });
      setIsAlertDialogOpen(false);
      setAlertMessage("");
      setSelectedTasksForAlert([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReview = (task: any, approve: boolean) => {
    setSelectedTask(task);
    setObservations("");
    if (approve) {
      reviewMutation.mutate({ taskId: task.id, status: "approved" });
    } else {
      setIsReviewDialogOpen(true);
    }
  };

  const handleSendObservations = () => {
    if (!selectedTask) return;
    if (!observations.trim()) {
      toast({
        title: "Observaciones requeridas",
        description: "Debes ingresar observaciones para rechazar la tarea",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate({ taskId: selectedTask.id, status: "observado", obs: observations });
  };

  const handleSendAlerts = () => {
    if (selectedTasksForAlert.length === 0) {
      toast({
        title: "Selecciona usuarios",
        description: "Debes seleccionar al menos un usuario para enviar alertas",
        variant: "destructive",
      });
      return;
    }
    if (!alertMessage.trim()) {
      toast({
        title: "Mensaje requerido",
        description: "Debes escribir un mensaje para la alerta",
        variant: "destructive",
      });
      return;
    }
    sendAlertMutation.mutate({ taskIds: selectedTasksForAlert, message: alertMessage });
  };

  const handleSelectAllUrgent = () => {
    if (selectedTasksForAlert.length === urgentPendingTasks.length) {
      setSelectedTasksForAlert([]);
    } else {
      setSelectedTasksForAlert(urgentPendingTasks.map(t => t.id));
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasksForAlert(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getDeadlineStatus = (endDate: string) => {
    const end = new Date(endDate);
    const daysLeft = differenceInDays(end, new Date());
    
    if (isPast(end) && !isToday(end)) {
      return {
        type: "overdue",
        badge: <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>,
        daysText: `Hace ${Math.abs(daysLeft)} días`,
      };
    } else if (daysLeft <= 3 && daysLeft >= 0) {
      return {
        type: "urgent",
        badge: <Badge className="bg-orange-500"><Clock className="h-3 w-3 mr-1" />Urgente</Badge>,
        daysText: daysLeft === 0 ? "Hoy" : `${daysLeft} días`,
      };
    } else if (daysLeft <= 7) {
      return {
        type: "warning",
        badge: <Badge className="bg-yellow-500 text-black"><Clock className="h-3 w-3 mr-1" />Próximo</Badge>,
        daysText: `${daysLeft} días`,
      };
    }
    return {
      type: "normal",
      badge: null,
      daysText: daysLeft > 0 ? `${daysLeft} días` : "",
    };
  };

  const generateReport = async () => {
    if (!allTasks || allTasks.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay actividades para generar el informe",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    let y = await drawPDFHeader(doc);
    y += 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE ACTIVIDADES", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(12);
    doc.text(`Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, pageWidth / 2, y, {
      align: "center",
    });
    y += 10;

    const tasksByPlan = allTasks.reduce((acc: any, task: any) => {
      const planId = task.planning_activities.plan_id;
      if (!acc[planId]) acc[planId] = [];
      acc[planId].push(task);
      return acc;
    }, {});

    for (const planId in tasksByPlan) {
      const planTasks = tasksByPlan[planId];
      
      const tableData = planTasks.map((task: any) => {
        const activity = task.planning_activities;
        const startDate = format(new Date(activity.start_date), "dd/MM/yyyy", { locale: es });
        const endDate = format(new Date(activity.end_date), "dd/MM/yyyy", { locale: es });
        const statusMap: Record<string, string> = {
          approved: "✓ Aprobado",
          observado: "⚠ Observado",
          submitted: "📤 Enviado",
          pending: "⏳ Pendiente"
        };
        
        return [
          activity.activity,
          activity.objective,
          `${startDate}\n${endDate}`,
          task.user_profile.full_name,
          statusMap[task.status] || task.status,
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [["Actividad", "Objetivo", "Fechas", "Responsable", "Estado"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [218, 238, 243],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 45 },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 35 },
          4: { cellWidth: 30, halign: "center" },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    doc.save(`Informe_Actividades_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">⏳ Pendiente</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500">📤 En Revisión</Badge>;
      case "approved":
        return <Badge className="bg-green-500">✓ Aprobado</Badge>;
      case "observado":
        return <Badge variant="destructive">⚠ Observado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revisión de Actividades</h1>
          <p className="text-muted-foreground mt-2">Gestiona y revisa las actividades del cronograma</p>
        </div>
        <Button onClick={generateReport} disabled={!allTasks || allTasks.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Generar Informe PDF
        </Button>
      </div>

      {/* Alert for urgent pending tasks */}
      {urgentPendingTasks.length > 0 && (
        <Alert variant="destructive" className="mb-6 border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            ¡Atención! {urgentPendingTasks.length} actividad{urgentPendingTasks.length > 1 ? "es" : ""} pendiente{urgentPendingTasks.length > 1 ? "s" : ""} con plazo vencido o próximo a vencer
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">Puedes enviar alertas a los usuarios para recordarles completar sus actividades.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedTasksForAlert(urgentPendingTasks.map(t => t.id));
                setIsAlertDialogOpen(true);
              }}
            >
              <Bell className="mr-2 h-4 w-4" />
              Enviar Alerta Grupal ({urgentPendingTasks.length})
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="submitted" className="gap-2">
            📤 Por Revisar
            {submittedTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">{submittedTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            ⏳ Sin Enviar
            {pendingTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingTasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            ✓ Revisadas
            {reviewedTasks.length > 0 && (
              <Badge variant="secondary" className="ml-1">{reviewedTasks.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Submitted Tasks - To Review */}
        <TabsContent value="submitted">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Enviadas</CardTitle>
              <CardDescription>Listado de actividades con evidencia pendiente de revisión</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Fecha Envío</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Evidencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedTasks.length > 0 ? (
                    submittedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.user_profile.full_name}</TableCell>
                        <TableCell>{task.planning_activities.activity}</TableCell>
                        <TableCell>
                          {task.submitted_at
                            ? format(new Date(task.submitted_at), "dd/MM/yyyy HH:mm", { locale: es })
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {task.evidence_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={task.evidence_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Ver
                                </a>
                              </Button>
                            )}
                            {task.evidence_link && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={task.evidence_link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Link
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleReview(task, true)}
                              disabled={reviewMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReview(task, false)}
                              disabled={reviewMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Observar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay actividades pendientes de revisión
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tasks - Not Submitted Yet */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actividades Sin Enviar</CardTitle>
                  <CardDescription>Actividades que aún no han sido completadas por los usuarios</CardDescription>
                </div>
                {selectedTasksForAlert.length > 0 && (
                  <Button onClick={() => setIsAlertDialogOpen(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Alerta ({selectedTasksForAlert.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {urgentPendingTasks.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <Checkbox 
                    checked={selectedTasksForAlert.length === urgentPendingTasks.length && urgentPendingTasks.length > 0}
                    onCheckedChange={handleSelectAllUrgent}
                  />
                  <span className="text-sm text-muted-foreground">
                    Seleccionar todas las urgentes ({urgentPendingTasks.length})
                  </span>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado Plazo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map((task) => {
                      const deadlineStatus = getDeadlineStatus(task.planning_activities.end_date);
                      return (
                        <TableRow key={task.id} className={deadlineStatus.type === "overdue" ? "bg-destructive/5" : ""}>
                          <TableCell>
                            {(deadlineStatus.type === "overdue" || deadlineStatus.type === "urgent" || deadlineStatus.type === "warning") && (
                              <Checkbox
                                checked={selectedTasksForAlert.includes(task.id)}
                                onCheckedChange={() => toggleTaskSelection(task.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{task.user_profile.full_name}</TableCell>
                          <TableCell>{task.planning_activities.activity}</TableCell>
                          <TableCell>
                            {format(new Date(task.planning_activities.end_date), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {deadlineStatus.badge}
                              {deadlineStatus.daysText && (
                                <span className="text-xs text-muted-foreground">{deadlineStatus.daysText}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {(deadlineStatus.type === "overdue" || deadlineStatus.type === "urgent" || deadlineStatus.type === "warning") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTasksForAlert([task.id]);
                                  setIsAlertDialogOpen(true);
                                }}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Alertar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay actividades pendientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviewed Tasks */}
        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Revisadas</CardTitle>
              <CardDescription>Historial de actividades aprobadas u observadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Fecha Revisión</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Evidencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedTasks.length > 0 ? (
                    reviewedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.user_profile.full_name}</TableCell>
                        <TableCell>{task.planning_activities.activity}</TableCell>
                        <TableCell>
                          {task.reviewed_at
                            ? format(new Date(task.reviewed_at), "dd/MM/yyyy HH:mm", { locale: es })
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {task.evidence_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={task.evidence_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Ver
                                </a>
                              </Button>
                            )}
                            {task.evidence_link && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={task.evidence_link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Link
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay actividades revisadas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Observations Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Observaciones</DialogTitle>
            <DialogDescription>
              Ingresa las observaciones para que el usuario corrija la evidencia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Describe qué debe corregir el usuario..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendObservations} disabled={reviewMutation.isPending}>
              Enviar Observaciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Enviar Alerta a Usuarios
            </DialogTitle>
            <DialogDescription>
              Se enviará una notificación a {selectedTasksForAlert.length} usuario{selectedTasksForAlert.length > 1 ? "s" : ""} 
              para recordarles completar sus actividades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios seleccionados:
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedTasksForAlert.map(taskId => {
                  const task = allTasks?.find(t => t.id === taskId);
                  return task ? (
                    <Badge key={taskId} variant="outline" className="text-xs">
                      {task.user_profile.full_name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertMessage">Mensaje de Alerta</Label>
              <Textarea
                id="alertMessage"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Ej: Por favor completa tu actividad lo antes posible. El plazo está por vencer..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAlertDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendAlerts} disabled={sendAlertMutation.isPending} className="bg-orange-500 hover:bg-orange-600">
              <Send className="mr-2 h-4 w-4" />
              Enviar Alertas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
