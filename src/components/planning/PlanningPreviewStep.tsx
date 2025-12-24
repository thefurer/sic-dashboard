import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, FileDown, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generatePlanningPDF } from "@/lib/planningPdfGenerator";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PlanningPreviewStepProps {
  planId: string | null;
  setPlanId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function PlanningPreviewStep({
  planId,
  onBack,
}: PlanningPreviewStepProps) {
  const navigate = useNavigate();
  const [planData, setPlanData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (planId) {
      loadPlanData();
    }
  }, [planId]);

  const loadPlanData = async () => {
    if (!planId) return;

    const { data: plan, error: planError } = await supabase
      .from("planning_sheets")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) {
      toast.error("Error al cargar planificación");
      return;
    }

    const { data: activities, error: activitiesError } = await supabase
      .from("planning_activities")
      .select("*")
      .eq("plan_id", planId)
      .order("order_index");

    if (activitiesError) {
      toast.error("Error al cargar actividades");
      return;
    }

    const { data: members, error: membersError } = await supabase
      .from("planning_members")
      .select("member_type, profile_id, profiles(id, full_name)")
      .eq("plan_id", planId);

    if (membersError) {
      toast.error("Error al cargar equipo");
      return;
    }

    setPlanData({ plan, activities, members });
  };

  const handleGeneratePDF = async () => {
    if (!planData) return;

    setGenerating(true);
    try {
      await generatePlanningPDF(planData);
      toast.success("PDF generado correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al generar PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalize = async () => {
    if (!planId || !planData) return;

    setFinalizing(true);
    try {
      // First, create assigned_tasks for all activities and their responsibles
      await createAssignedTasksForAllActivities();

      const { error } = await supabase
        .from("planning_sheets")
        .update({ status: "finalized" })
        .eq("id", planId);

      if (error) throw error;

      toast.success("Planificación finalizada y actividades asignadas a responsables");
      navigate("/admin/planning");
    } catch (error: any) {
      toast.error(error.message || "Error al finalizar");
    } finally {
      setFinalizing(false);
    }
  };

  const createAssignedTasksForAllActivities = async () => {
    if (!planId || !planData?.activities || !planData?.members) return;

    const { activities, members } = planData;
    
    // Create a map of full_name/email to profile_id
    const memberMap = new Map<string, string>();
    members.forEach((m: any) => {
      memberMap.set(m.profiles.full_name, m.profile_id || m.profiles?.id);
    });

    // Also get profile_ids from planning_members table
    const { data: planningMembers } = await supabase
      .from("planning_members")
      .select("profile_id, profiles(full_name)")
      .eq("plan_id", planId);

    planningMembers?.forEach((pm: any) => {
      memberMap.set(pm.profiles.full_name, pm.profile_id);
    });

    // Delete existing assigned_tasks for this plan to avoid duplicates
    await supabase
      .from("assigned_tasks")
      .delete()
      .eq("plan_id", planId);

    // Create tasks for each activity and its responsibles
    const tasksToInsert: any[] = [];
    
    for (const activity of activities) {
      const responsibles = activity.responsibles || [];
      
      for (const responsible of responsibles) {
        // Try to find profile_id by name
        let profileId = memberMap.get(responsible);
        
        // If not found directly, search by partial match
        if (!profileId) {
          for (const [name, id] of memberMap.entries()) {
            if (name.toLowerCase().includes(responsible.toLowerCase()) || 
                responsible.toLowerCase().includes(name.toLowerCase())) {
              profileId = id;
              break;
            }
          }
        }
        
        if (profileId) {
          tasksToInsert.push({
            activity_id: activity.id,
            plan_id: planId,
            user_id: profileId,
            status: "pending",
          });
        }
      }
    }

    if (tasksToInsert.length > 0) {
      const { error } = await supabase
        .from("assigned_tasks")
        .insert(tasksToInsert);

      if (error) {
        console.error("Error creating assigned tasks:", error);
        throw new Error("Error al asignar tareas a los responsables");
      }
    }
  };

  if (!planData) {
    return <div>Cargando...</div>;
  }

  const { plan, activities, members } = planData;
  const docentes = members?.filter((m: any) => m.member_type === "docente") || [];
  const estudiantes = members?.filter((m: any) => m.member_type === "estudiante") || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">{plan.period_name}</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Presidente</p>
              <p className="font-medium">{plan.president_name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Horario de Reuniones</p>
              <div className="space-y-1">
                {plan.meeting_schedule && Array.isArray(plan.meeting_schedule) && plan.meeting_schedule.length > 0 ? (
                  plan.meeting_schedule.map((item: any, index: number) => {
                    if (typeof item === 'string') {
                      // Legacy format
                      return <p key={index}>{format(new Date(item), "dd/MM/yyyy", { locale: es })}</p>;
                    } else if (item.date && item.time) {
                      // New format with time
                      return (
                        <p key={index}>
                          {format(new Date(item.date), "dd/MM/yyyy", { locale: es })} - {item.time}
                        </p>
                      );
                    }
                    return null;
                  })
                ) : (
                  <p className="text-muted-foreground">No hay reuniones programadas</p>
                )}
              </div>
            </div>

            {plan.drive_link && (
              <div>
                <p className="text-sm text-muted-foreground">Enlace Drive</p>
                <a href={plan.drive_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {plan.drive_link}
                </a>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Miembros Docentes ({docentes.length})</p>
              <div className="flex flex-wrap gap-2">
                {docentes.map((m: any, i: number) => (
                  <Badge key={i} variant="secondary">{m.profiles.full_name}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Estudiantes ({estudiantes.length})</p>
              <div className="flex flex-wrap gap-2">
                {estudiantes.map((m: any, i: number) => (
                  <Badge key={i} variant="outline">{m.profiles.full_name}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Actividades Registradas</p>
              <p className="text-2xl font-bold text-primary">{activities.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Button onClick={handleGeneratePDF} disabled={generating} size="lg" className="w-full">
          <FileDown className="mr-2 h-5 w-5" />
          {generating ? "Generando PDF..." : "Generar PDF Oficial"}
        </Button>

        {plan.status === "draft" && (
          <Button onClick={handleFinalize} disabled={finalizing} variant="default" size="lg" className="w-full">
            <CheckCircle className="mr-2 h-5 w-5" />
            {finalizing ? "Finalizando..." : "Finalizar Planificación"}
          </Button>
        )}
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      </div>
    </div>
  );
}
