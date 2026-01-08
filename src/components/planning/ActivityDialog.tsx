import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
  activity: any | null;
  onSaved: () => void;
  nextOrderIndex: number;
}

interface TeamMember {
  label: string;
  value: string; // profile_id
  fullName: string;
}

export function ActivityDialog({
  open,
  onOpenChange,
  planId,
  activity,
  onSaved,
  nextOrderIndex,
}: ActivityDialogProps) {
  const [activityText, setActivityText] = useState("");
  const [objective, setObjective] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [verificationMeans, setVerificationMeans] = useState("");
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && planId) {
      loadTeamMembers();
    }

    if (activity) {
      setActivityText(activity.activity);
      setObjective(activity.objective);
      setStartDate(new Date(activity.start_date));
      setEndDate(new Date(activity.end_date));
      setVerificationMeans(activity.verification_means);
      // Map responsibles names to profile IDs if needed
      setSelectedResponsibles(activity.responsibles || []);
    } else {
      resetForm();
    }
  }, [open, activity, planId]);

  const loadTeamMembers = async () => {
    if (!planId) return;

    const { data, error } = await supabase
      .from("planning_members")
      .select("profile_id, profiles(id, full_name)")
      .eq("plan_id", planId);

    if (error) {
      toast.error("Error al cargar equipo");
      return;
    }

    // Fetch emails for matching
    const memberIds = data?.map((m: any) => m.profile_id) || [];
    let emailMap = new Map<string, string>();
    
    if (memberIds.length > 0) {
      const { data: contacts } = await supabase
        .from("profile_contacts")
        .select("user_id, email")
        .in("user_id", memberIds);
      
      contacts?.forEach((c: any) => {
        if (c.email) {
          emailMap.set(c.email.toLowerCase(), c.user_id);
        }
      });
    }

    const members = data?.map((m: any) => ({
      label: m.profiles.full_name,
      value: m.profile_id, // Use profile_id as value for proper task assignment
      fullName: m.profiles.full_name,
    })) || [];

    setTeamMembers(members);

    // If editing, map existing responsibles (names or emails) to IDs
    if (activity && activity.responsibles) {
      const responsibleIds = activity.responsibles.map((name: string) => {
        // First try to find by full name
        const member = members.find(m => m.fullName.toLowerCase() === name.toLowerCase());
        if (member) return member.value;
        
        // Then try by email
        const idByEmail = emailMap.get(name.toLowerCase());
        if (idByEmail) return idByEmail;
        
        // Partial match
        const partialMatch = members.find(m => 
          m.fullName.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(m.fullName.toLowerCase())
        );
        return partialMatch?.value || name;
      });
      setSelectedResponsibles(responsibleIds);
    }
  };

  const resetForm = () => {
    setActivityText("");
    setObjective("");
    setStartDate(undefined);
    setEndDate(undefined);
    setVerificationMeans("");
    setSelectedResponsibles([]);
  };

  const handleSave = async () => {
    if (!planId || !activityText || !objective || !startDate || !endDate || !verificationMeans) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    if (selectedResponsibles.length === 0) {
      toast.error("Selecciona al menos un responsable");
      return;
    }

    setSaving(true);

    try {
      // Convert selected IDs back to names for storage in responsibles field
      const responsibleNames = selectedResponsibles.map(id => {
        const member = teamMembers.find(m => m.value === id);
        return member?.fullName || id;
      });

      const activityData = {
        plan_id: planId,
        activity: activityText,
        objective,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        verification_means: verificationMeans,
        responsibles: responsibleNames,
        order_index: activity ? activity.order_index : nextOrderIndex,
      };

      let activityId = activity?.id;

      if (activity) {
        const { error } = await supabase
          .from("planning_activities")
          .update(activityData)
          .eq("id", activity.id);

        if (error) throw error;
      } else {
        const { data: newActivity, error } = await supabase
          .from("planning_activities")
          .insert(activityData)
          .select("id")
          .single();

        if (error) throw error;
        activityId = newActivity.id;
      }

      // Now create/update assigned_tasks for each responsible
      if (activityId) {
        await assignTasksToResponsibles(activityId, planId, selectedResponsibles, activity !== null);
      }

      toast.success(activity ? "Actividad actualizada" : "Actividad agregada y asignada a responsables");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const assignTasksToResponsibles = async (
    activityId: string, 
    planId: string, 
    responsibleIds: string[],
    isUpdate: boolean
  ) => {
    try {
      if (isUpdate) {
        // Get existing assigned tasks for this activity
        const { data: existingTasks } = await supabase
          .from("assigned_tasks")
          .select("user_id")
          .eq("activity_id", activityId);

        const existingUserIds = existingTasks?.map(t => t.user_id) || [];
        
        // Find new responsibles that don't have tasks yet
        const newResponsibles = responsibleIds.filter(id => !existingUserIds.includes(id));
        
        // Find responsibles that were removed
        const removedResponsibles = existingUserIds.filter(id => !responsibleIds.includes(id));

        // Delete tasks for removed responsibles (only if pending)
        if (removedResponsibles.length > 0) {
          await supabase
            .from("assigned_tasks")
            .delete()
            .eq("activity_id", activityId)
            .in("user_id", removedResponsibles)
            .eq("status", "pending");
        }

        // Create tasks for new responsibles
        if (newResponsibles.length > 0) {
          const newTasks = newResponsibles.map(userId => ({
            activity_id: activityId,
            plan_id: planId,
            user_id: userId,
            status: "pending",
          }));

          const { error } = await supabase
            .from("assigned_tasks")
            .insert(newTasks);

          if (error) throw error;
        }
      } else {
        // New activity - create tasks for all responsibles
        const tasks = responsibleIds.map(userId => ({
          activity_id: activityId,
          plan_id: planId,
          user_id: userId,
          status: "pending",
        }));

        const { error } = await supabase
          .from("assigned_tasks")
          .insert(tasks);

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error assigning tasks:", error);
      // Don't throw - activity was saved, just log the error
      toast.error("Actividad guardada pero hubo un error al asignar tareas");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Editar Actividad" : "Nueva Actividad"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="activity">Actividad *</Label>
            <Textarea
              id="activity"
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              placeholder="Describe la actividad..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="objective">Objetivo *</Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Define el objetivo..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Inicio *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={es} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Fecha de Fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={es} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="verification">Medios de Verificación *</Label>
            <Input
              id="verification"
              value={verificationMeans}
              onChange={(e) => setVerificationMeans(e.target.value)}
              placeholder="Ej: Actas, Informes, Documentos..."
            />
          </div>

          <div>
            <Label>Responsables *</Label>
            <MultiSelect
              options={teamMembers.map(m => ({ label: m.label, value: m.value }))}
              selected={selectedResponsibles}
              onChange={setSelectedResponsibles}
              placeholder="Selecciona responsables..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
