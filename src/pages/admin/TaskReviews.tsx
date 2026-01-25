import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, ExternalLink, Download, Bell, AlertTriangle, Clock, Send, Users, Pencil, Trash2, RotateCcw, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { drawPDFHeader } from "@/lib/pdfHeaderUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { openSignedUrl } from "@/hooks/useSignedUrl";
import { sendNotificationEmail, getUserEmail, getUserName } from "@/hooks/useSendEmail";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editObservations, setEditObservations] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [isClearPendingDialogOpen, setIsClearPendingDialogOpen] = useState(false);
  const [isClearReviewedDialogOpen, setIsClearReviewedDialogOpen] = useState(false);
  const [showUrgentAlert, setShowUrgentAlert] = useState(true);

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
          .select("id, full_name")
          .in("id", userIds);

        // Map profiles to tasks
        const tasksWithProfiles = data.map(task => ({
          ...task,
          user_profile: profilesData?.find(p => p.id === task.user_id) || { full_name: "Usuario desconocido" }
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
    mutationFn: async ({ taskId, status, obs, task }: { taskId: string; status: string; obs?: string; task?: any }) => {
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

      // Send email notification if status is "observed" (needs correction)
      if (status === "observed" && obs && task?.user_id) {
        const email = await getUserEmail(task.user_id);
        const userName = await getUserName(task.user_id);
        
        if (email) {
          sendNotificationEmail({
            type: "activity_correction",
            to: email,
            userName,
            data: {
              activityName: task.planning_activities?.activity || "Actividad",
              observations: obs,
              deadline: task.planning_activities?.end_date,
            },
          }).catch(err => console.error("Error sending notification:", err));
        }
      }
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
    mutationFn: async ({ taskIds, message, tasks }: { taskIds: string[]; message: string; tasks?: any[] }) => {
      // Update tasks with admin observations as an alert/reminder
      const { error } = await supabase
        .from("assigned_tasks")
        .update({
          admin_observations: `[ALERTA ${format(new Date(), "dd/MM/yyyy")}]: ${message}`,
        })
        .in("id", taskIds);

      if (error) throw error;

      // Send email notifications to all affected users
      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          const email = await getUserEmail(task.user_id);
          const userName = await getUserName(task.user_id);
          
          if (email) {
            sendNotificationEmail({
              type: "admin_alert",
              to: email,
              userName,
              data: {
                activityName: task.planning_activities?.activity || "Actividad",
                observations: message,
                deadline: task.planning_activities?.end_date,
              },
            }).catch(err => console.error("Error sending notification:", err));
          }
        }
      }
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

  // Update task mutation (for editing reviewed tasks)
  const updateTaskMutation = useMutation({
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
        title: "Tarea actualizada",
        description: "El estado de la tarea ha sido actualizado correctamente",
      });
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      setEditObservations("");
      setEditStatus("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("assigned_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assigned-tasks"] });
      toast({
        title: "Tarea eliminada",
        description: "La asignación ha sido eliminada correctamente",
      });
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear all pending tasks mutation
  const clearPendingTasksMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase
        .from("assigned_tasks")
        .delete()
        .in("id", taskIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assigned-tasks"] });
      toast({
        title: "Actividades eliminadas",
        description: "Las actividades sin enviar han sido eliminadas correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear all reviewed tasks mutation
  const clearReviewedTasksMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { error } = await supabase
        .from("assigned_tasks")
        .delete()
        .in("id", taskIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assigned-tasks"] });
      toast({
        title: "Actividades eliminadas",
        description: "Las actividades revisadas han sido eliminadas correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setEditObservations(task.admin_observations || "");
    setEditStatus(task.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;
    updateTaskMutation.mutate({
      taskId: selectedTask.id,
      status: editStatus,
      obs: editObservations.trim() || undefined,
    });
  };

  const handleDeleteTask = (task: any) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTaskMutation.mutate(taskToDelete.id);
  };

  const handleResetToPending = (task: any) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      status: "pending",
      obs: undefined,
    });
  };

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
    // Get the actual tasks for the selected IDs to send email notifications
    const tasksToAlert = pendingTasks.filter(t => selectedTasksForAlert.includes(t.id));
    sendAlertMutation.mutate({ taskIds: selectedTasksForAlert, message: alertMessage, tasks: tasksToAlert });
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

  // Footer drawing function for PDF
  const drawPageFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const footerY = pageHeight - 20;

    // Draw separator line (Navy Blue)
    doc.setDrawColor(31, 78, 121);
    doc.setLineWidth(0.8);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

    // Email line (Navy Blue, Bold)
    doc.setTextColor(31, 78, 121);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("E-mail: grupo.gisicf@unesum.edu.ec", pageWidth / 2, footerY, { align: "center" });

    // Address line (Black, Regular)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Complejo Deportivo – UNESUM – Km. 1 vía Noboa", pageWidth / 2, footerY + 4, { align: "center" });
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerMargin = 45; // Space needed for footer + signatures

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
          approved: "Aprobado",
          observado: "Observado",
          submitted: "Enviado",
          pending: "Pendiente",
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
        margin: { bottom: footerMargin },
        didDrawPage: (data) => {
          drawPageFooter(doc);
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Fetch signature names from settings
    const { data: settings } = await supabase
      .from("app_settings")
      .select("signature_president_name, signature_coordinator_name, signature_responsible_name")
      .single();

    const coordinadorGrupoName = settings?.signature_coordinator_name || "Ing. Christian Caicedo Plúa, PhD";
    const responsableComisionName = settings?.signature_responsible_name || "Ing. Karina Mero, MSc";
    const coordinadorCarreraName = settings?.signature_president_name || "Ing. Javier Marcillo Merino, Mg";

    // Calculate if we need a new page for signatures (need at least 60mm space)
    const signatureSpaceNeeded = 60;
    let finalY = (doc as any).lastAutoTable.finalY + 25;

    if (finalY + signatureSpaceNeeded > pageHeight - 25) {
      doc.addPage();
      drawPageFooter(doc);
      finalY = 40;
    }

    // Reset text color to black for signatures
    doc.setTextColor(0, 0, 0);
    
    // Three-column signature layout
    const colWidth = (pageWidth - 28) / 3;
    const leftX = 14 + colWidth / 2;
    const centerX = pageWidth / 2;
    const rightX = pageWidth - 14 - colWidth / 2;
    
    // Left signature line (Coordinador del Grupo GISICF)
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(leftX - 25, finalY, leftX + 25, finalY);
    
    // Left signature - Name (Bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(coordinadorGrupoName, leftX, finalY + 5, { align: "center" });
    
    // Left signature - Title (Regular, wrapped)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const titleLeft = "Coordinador del Grupo de Investigación GISICF";
    const splitTitleLeft = doc.splitTextToSize(titleLeft, 50);
    doc.text(splitTitleLeft, leftX, finalY + 10, { align: "center" });
    
    // Center signature line (Responsable Comisión de Investigación)
    doc.line(centerX - 25, finalY, centerX + 25, finalY);
    
    // Center signature - Name (Bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(responsableComisionName, centerX, finalY + 5, { align: "center" });
    
    // Center signature - Title (Regular, wrapped)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const titleCenter = "Responsable Comisión de Investigación";
    const splitTitleCenter = doc.splitTextToSize(titleCenter, 50);
    doc.text(splitTitleCenter, centerX, finalY + 10, { align: "center" });
    
    // Right signature line (Coordinador de la Carrera de TI)
    doc.line(rightX - 25, finalY, rightX + 25, finalY);
    
    // Right signature - Name (Bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(coordinadorCarreraName, rightX, finalY + 5, { align: "center" });
    
    // Right signature - Title (Regular, wrapped)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const titleRight = "Coordinador de la Carrera de TI";
    const splitTitleRight = doc.splitTextToSize(titleRight, 50);
    doc.text(splitTitleRight, rightX, finalY + 10, { align: "center" });

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
      {showUrgentAlert && urgentPendingTasks.length > 0 && (
        <Alert variant="destructive" className="mb-6 border-2 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            onClick={() => setShowUrgentAlert(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold pr-8">
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openSignedUrl('evaluation-evidence', task.evidence_url)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Ver
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
                <div className="flex gap-2">
                  {pendingTasks.length > 0 && (
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsClearPendingDialogOpen(true)}
                      disabled={clearPendingTasksMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {clearPendingTasksMutation.isPending ? "Eliminando..." : "Limpiar Todas"}
                    </Button>
                  )}
                  {selectedTasksForAlert.length > 0 && (
                    <Button onClick={() => setIsAlertDialogOpen(true)}>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Alerta ({selectedTasksForAlert.length})
                    </Button>
                  )}
                </div>
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
                    <TableHead>Visto</TableHead>
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
                          <TableCell>
                            {task.read_at ? (
                              <div className="flex items-center gap-1 text-primary">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs">
                                  {format(new Date(task.read_at), "dd/MM HH:mm", { locale: es })}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs">No visto</span>
                              </div>
                            )}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actividades Revisadas</CardTitle>
                  <CardDescription>Historial de actividades aprobadas u observadas</CardDescription>
                </div>
                {reviewedTasks.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsClearReviewedDialogOpen(true)}
                    disabled={clearReviewedTasksMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {clearReviewedTasksMutation.isPending ? "Eliminando..." : "Eliminar Todas"}
                  </Button>
                )}
              </div>
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
                    <TableHead className="text-right">Acciones</TableHead>
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openSignedUrl('evaluation-evidence', task.evidence_url)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Ver
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
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditTask(task)}
                              title="Editar estado"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResetToPending(task)}
                              title="Devolver a pendiente"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTask(task)}
                              title="Eliminar asignación"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
              <SmartTextarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Describe qué debe corregir el usuario..."
                rows={5}
                storageKey="task_observations"
                quickSuggestions={[
                  "La evidencia presentada no corresponde a la actividad descrita. Por favor suba el documento correcto.",
                  "Falta incluir el medio de verificación. Adjunte el documento de respaldo.",
                  "La descripción de la evidencia es insuficiente. Detalle cómo la evidencia demuestra el cumplimiento.",
                  "El archivo adjunto no se puede abrir. Por favor suba nuevamente en formato PDF.",
                  "Falta la firma o validación institucional en el documento.",
                  "El enlace proporcionado no funciona. Verifique y actualice la URL.",
                  "La evidencia debe incluir fecha y nombre del responsable.",
                ]}
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
              <SmartTextarea
                id="alertMessage"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Ej: Por favor completa tu actividad lo antes posible. El plazo está por vencer..."
                rows={4}
                storageKey="task_alerts"
                quickSuggestions={[
                  "Por favor completa tu actividad lo antes posible. El plazo está por vencer.",
                  "Recordatorio: Tu actividad asignada está próxima a vencer. Sube tu evidencia cuanto antes.",
                  "URGENTE: El plazo para esta actividad venció. Contacta al coordinador.",
                  "Favor completar la actividad pendiente para evitar atrasos en el cronograma.",
                  "Se requiere tu participación inmediata para cumplir con los objetivos del plan.",
                ]}
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

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Estado de Tarea
            </DialogTitle>
            <DialogDescription>
              Modifica el estado y observaciones de esta actividad
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editStatus">Estado</Label>
              <select
                id="editStatus"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="approved">Aprobado</option>
                <option value="observado">Observado</option>
                <option value="submitted">Enviado (sin revisar)</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editObservations">Observaciones (opcional)</Label>
              <SmartTextarea
                id="editObservations"
                value={editObservations}
                onChange={(e) => setEditObservations(e.target.value)}
                placeholder="Observaciones para el usuario..."
                rows={4}
                storageKey="task_observations"
                quickSuggestions={[
                  "Actividad aprobada. Buen trabajo.",
                  "Evidencia verificada correctamente.",
                  "Se requieren ajustes menores en la documentación.",
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTask} disabled={updateTaskMutation.isPending}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la asignación de la actividad 
              "{taskToDelete?.planning_activities?.activity}" del usuario {taskToDelete?.user_profile?.full_name}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Pending Tasks Confirmation Dialog */}
      <AlertDialog open={isClearPendingDialogOpen} onOpenChange={setIsClearPendingDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ¿Eliminar todas las actividades pendientes?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Esta acción eliminará <strong>{pendingTasks.length} actividades</strong> sin enviar. 
                  Esta acción no se puede deshacer.
                </p>
                <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium mb-2 text-foreground">Usuarios afectados:</p>
                  <ul className="space-y-1">
                    {/* Get unique users with their task counts */}
                    {Object.entries(
                      pendingTasks.reduce((acc: Record<string, { name: string; count: number }>, task) => {
                        const userId = task.user_id;
                        const userName = task.user_profile?.full_name || "Usuario desconocido";
                        if (!acc[userId]) {
                          acc[userId] = { name: userName, count: 0 };
                        }
                        acc[userId].count++;
                        return acc;
                      }, {})
                    ).map(([userId, data]) => (
                      <li key={userId} className="text-sm flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{data.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {data.count} {data.count === 1 ? "actividad" : "actividades"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearPendingTasksMutation.mutate(pendingTasks.map(t => t.id));
                setIsClearPendingDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar {pendingTasks.length} actividades
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Reviewed Tasks Confirmation Dialog */}
      <AlertDialog open={isClearReviewedDialogOpen} onOpenChange={setIsClearReviewedDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              ¿Eliminar todas las actividades revisadas?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Esta acción eliminará <strong>{reviewedTasks.length} actividades</strong> revisadas (aprobadas u observadas). 
                  Esta acción no se puede deshacer.
                </p>
                <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium mb-2 text-foreground">Usuarios afectados:</p>
                  <ul className="space-y-1">
                    {Object.entries(
                      reviewedTasks.reduce((acc: Record<string, { name: string; count: number }>, task) => {
                        const userId = task.user_id;
                        const userName = task.user_profile?.full_name || "Usuario desconocido";
                        if (!acc[userId]) {
                          acc[userId] = { name: userName, count: 0 };
                        }
                        acc[userId].count++;
                        return acc;
                      }, {})
                    ).map(([userId, data]) => (
                      <li key={userId} className="text-sm flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{data.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {data.count} {data.count === 1 ? "actividad" : "actividades"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearReviewedTasksMutation.mutate(reviewedTasks.map(t => t.id));
                setIsClearReviewedDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar {reviewedTasks.length} actividades
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
