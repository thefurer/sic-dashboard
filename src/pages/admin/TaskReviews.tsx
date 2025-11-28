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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, ExternalLink, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { drawPDFHeader } from "@/lib/pdfHeaderUtils";

export default function TaskReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [observations, setObservations] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Fetch submitted tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["submitted-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assigned_tasks")
        .select(`
          *,
          planning_activities!inner(activity, objective, start_date, end_date, plan_id)
        `)
        .in("status", ["submitted", "approved", "observado"])
        .order("submitted_at", { ascending: false });

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
      queryClient.invalidateQueries({ queryKey: ["submitted-tasks"] });
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

  const handleReview = (task: any, approve: boolean) => {
    setSelectedTask(task);
    setObservations("");
    if (approve) {
      // Approve directly
      reviewMutation.mutate({ taskId: task.id, status: "approved" });
    } else {
      // Open dialog for observations
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

  const generateReport = async () => {
    if (!tasks || tasks.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay actividades para generar el informe",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Draw header
    let y = await drawPDFHeader(doc);
    y += 10;

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME DE ACTIVIDADES", pageWidth / 2, y, { align: "center" });
    y += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.text(`Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, pageWidth / 2, y, {
      align: "center",
    });
    y += 10;

    // Group tasks by plan
    const tasksByPlan = tasks.reduce((acc: any, task: any) => {
      const planId = task.planning_activities.plan_id;
      if (!acc[planId]) acc[planId] = [];
      acc[planId].push(task);
      return acc;
    }, {});

    // Generate table for each plan
    for (const planId in tasksByPlan) {
        const planTasks = tasksByPlan[planId];
      
      const tableData = planTasks.map((task: any) => {
        const activity = task.planning_activities;
        const startDate = format(new Date(activity.start_date), "dd/MM/yyyy", { locale: es });
        const endDate = format(new Date(activity.end_date), "dd/MM/yyyy", { locale: es });
        const statusBadge = task.status === "approved" ? "✓ Aprobado" : task.status === "observado" ? "⚠ Observado" : "⏳ En revisión";
        
        return [
          activity.activity,
          activity.objective,
          `${startDate}\n${endDate}`,
          task.user_profile.full_name,
          statusBadge,
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
      case "submitted":
        return <Badge variant="secondary">⏳ En Revisión</Badge>;
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revisión de Actividades</h1>
          <p className="text-muted-foreground mt-2">Revisa y aprueba las evidencias subidas por los usuarios</p>
        </div>
        <Button onClick={generateReport} disabled={!tasks || tasks.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Generar Informe PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividades Enviadas</CardTitle>
          <CardDescription>Listado de todas las actividades con evidencia subida</CardDescription>
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
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
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
                      {task.status === "submitted" && (
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
                      )}
                      {task.status === "approved" && (
                        <Badge className="bg-green-500">Aprobado</Badge>
                      )}
                      {task.status === "observado" && (
                        <Badge variant="destructive">Requiere corrección</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay actividades enviadas para revisión
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  );
}
