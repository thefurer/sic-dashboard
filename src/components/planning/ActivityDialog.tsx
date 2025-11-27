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
  const [teamMembers, setTeamMembers] = useState<{ label: string; value: string }[]>([]);
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
      setSelectedResponsibles(activity.responsibles || []);
    } else {
      resetForm();
    }
  }, [open, activity, planId]);

  const loadTeamMembers = async () => {
    if (!planId) return;

    const { data, error } = await supabase
      .from("planning_members")
      .select("profile_id, profiles(full_name)")
      .eq("plan_id", planId);

    if (error) {
      toast.error("Error al cargar equipo");
      return;
    }

    const members = data?.map((m: any) => ({
      label: m.profiles.full_name,
      value: m.profiles.full_name,
    })) || [];

    setTeamMembers(members);
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
      const activityData = {
        plan_id: planId,
        activity: activityText,
        objective,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        verification_means: verificationMeans,
        responsibles: selectedResponsibles,
        order_index: activity ? activity.order_index : nextOrderIndex,
      };

      if (activity) {
        const { error } = await supabase
          .from("planning_activities")
          .update(activityData)
          .eq("id", activity.id);

        if (error) throw error;
        toast.success("Actividad actualizada");
      } else {
        const { error } = await supabase
          .from("planning_activities")
          .insert(activityData);

        if (error) throw error;
        toast.success("Actividad agregada");
      }

      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setSaving(false);
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
              options={teamMembers}
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
