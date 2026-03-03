import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";

interface PlanningTeamStepProps {
  planId: string | null;
  setPlanId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface Profile {
  id: string;
  full_name: string;
}

export function PlanningTeamStep({
  planId,
  onNext,
  onBack,
}: PlanningTeamStepProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedDocentes, setSelectedDocentes] = useState<string[]>([]);
  const [selectedEstudiantes, setSelectedEstudiantes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
    if (planId) {
      loadTeamMembers();
    }
  }, [planId]);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("is_approved", true)
      .order("full_name");

    if (error) {
      toast.error("Error al cargar perfiles");
      return;
    }

    setProfiles(data || []);
  };

  const loadTeamMembers = async () => {
    if (!planId) return;

    const { data, error } = await supabase
      .from("planning_members")
      .select("profile_id, member_type")
      .eq("plan_id", planId);

    if (error) {
      toast.error("Error al cargar equipo");
      return;
    }

    const docentes = data?.filter((m) => m.member_type === "docente").map((m) => m.profile_id) || [];
    const estudiantes = data?.filter((m) => m.member_type === "estudiante").map((m) => m.profile_id) || [];

    setSelectedDocentes(docentes);
    setSelectedEstudiantes(estudiantes);
  };

  const handleSave = async () => {
    if (!planId) {
      toast.error("Error: No hay planificación activa");
      return;
    }

    if (selectedDocentes.length === 0 && selectedEstudiantes.length === 0) {
      toast.error("Debes seleccionar al menos un miembro");
      return;
    }

    setLoading(true);

    try {
      // Delete existing members
      await supabase.from("planning_members").delete().eq("plan_id", planId);

      // Insert new members
      const members = [
        ...selectedDocentes.map((id) => ({
          plan_id: planId,
          profile_id: id,
          member_type: "docente",
        })),
        ...selectedEstudiantes.map((id) => ({
          plan_id: planId,
          profile_id: id,
          member_type: "estudiante",
        })),
      ];

      const { error } = await supabase.from("planning_members").insert(members);

      if (error) throw error;

      toast.success("Equipo guardado correctamente");
      onNext();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const profileOptions = profiles.map((p) => ({
    label: p.full_name,
    value: p.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          <UserPlus className="inline mr-2 h-5 w-5" />
          Miembros Docentes e Invitados
        </Label>
        <MultiSelect
          options={profileOptions}
          selected={selectedDocentes}
          onChange={setSelectedDocentes}
          placeholder="Selecciona docentes..."
        />
        {selectedDocentes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedDocentes.map((id) => {
              const profile = profiles.find((p) => p.id === id);
              return profile ? (
                <Badge key={id} variant="secondary">
                  {profile.full_name}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">
          <UserPlus className="inline mr-2 h-5 w-5" />
          Estudiantes
        </Label>
        <MultiSelect
          options={profileOptions}
          selected={selectedEstudiantes}
          onChange={setSelectedEstudiantes}
          placeholder="Selecciona estudiantes..."
        />
        {selectedEstudiantes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedEstudiantes.map((id) => {
              const profile = profiles.find((p) => p.id === id);
              return profile ? (
                <Badge key={id} variant="outline">
                  {profile.full_name}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Guardando..." : "Siguiente"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
