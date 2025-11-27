import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

interface PlanningGeneralStepProps {
  planId: string | null;
  setPlanId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function PlanningGeneralStep({ planId, setPlanId, onNext }: PlanningGeneralStepProps) {
  const [periodName, setPeriodName] = useState("");
  const [presidentName, setPresidentName] = useState("Ing. Mario Marcillo Merino, Mg.");
  const [meetingSchedule, setMeetingSchedule] = useState("Cada semana día miércoles");
  const [driveLink, setDriveLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      loadPlanData();
    }
  }, [planId]);

  const loadPlanData = async () => {
    if (!planId) return;

    const { data, error } = await supabase.from("planning_sheets").select("*").eq("id", planId).single();

    if (error) {
      toast.error("Error al cargar los datos");
      return;
    }

    if (data) {
      setPeriodName(data.period_name);
      setPresidentName(data.president_name);
      setMeetingSchedule(data.meeting_schedule);
      setDriveLink(data.drive_link || "");
    }
  };

  const handleSave = async () => {
    if (!periodName.trim()) {
      toast.error("El nombre del período es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      if (planId) {
        const { error } = await supabase
          .from("planning_sheets")
          .update({
            period_name: periodName,
            president_name: presidentName,
            meeting_schedule: meetingSchedule,
            drive_link: driveLink,
          })
          .eq("id", planId);

        if (error) throw error;
        toast.success("Datos actualizados");
      } else {
        const { data, error } = await supabase
          .from("planning_sheets")
          .insert({
            period_name: periodName,
            president_name: presidentName,
            meeting_schedule: meetingSchedule,
            drive_link: driveLink,
            created_by: userData.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPlanId(data.id);
          toast.success("Planificación creada");
        }
      }

      onNext();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="periodName">Nombre del Período *</Label>
        <Input
          id="periodName"
          value={periodName}
          onChange={(e) => setPeriodName(e.target.value)}
          placeholder="Ej: PII 2024"
          required
        />
      </div>

      <div>
        <Label htmlFor="presidentName">Presidente</Label>
        <Input id="presidentName" value={presidentName} onChange={(e) => setPresidentName(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="meetingSchedule">Horario de Reuniones</Label>
        <Input
          id="meetingSchedule"
          value={meetingSchedule}
          onChange={(e) => setMeetingSchedule(e.target.value)}
          placeholder="Ej: Cada semana día miércoles"
        />
      </div>

      <div>
        <Label htmlFor="driveLink">Enlace de Drive (Opcional)</Label>
        <Input
          id="driveLink"
          type="url"
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
          placeholder="https://drive.google.com/..."
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Guardando..." : "Siguiente"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
