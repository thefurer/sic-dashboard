import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProjectSelector from "./ProjectSelector";
import { MultiSelect } from "@/components/ui/multi-select";
import EvidenceUploader, { type Evidence } from "./EvidenceUploader";

export interface ProjectEntryData {
  id?: string;
  related_project_id: string;
  proposal_type: string;
  team_members: string[];
  project_roles: { director: string; principal: string };
  evidences: Evidence[];
}

interface ProjectEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProjectEntryData) => void;
  reportId: string;
  existingEntry?: ProjectEntryData;
  profiles: Array<{ id: string; full_name: string }>;
}

export default function ProjectEntryDialog({
  open,
  onClose,
  onSave,
  reportId,
  existingEntry,
  profiles,
}: ProjectEntryDialogProps) {
  const [relatedProjectId, setRelatedProjectId] = useState(existingEntry?.related_project_id || "");
  const [proposalType, setProposalType] = useState(existingEntry?.proposal_type || "");
  const [teamMembers, setTeamMembers] = useState<string[]>(existingEntry?.team_members || []);
  const [projectRoles, setProjectRoles] = useState<{ director: string; principal: string }>(
    existingEntry?.project_roles || { director: "", principal: "" }
  );
  const [evidences, setEvidences] = useState<Evidence[]>(existingEntry?.evidences || []);
  const [uploading, setUploading] = useState(false);

  const profileOptions = profiles.map(p => ({ value: p.id, label: p.full_name }));

  const sanitizeFilename = (filename: string): string => {
    return filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9._-]/gi, "_")
      .toLowerCase();
  };

  const handleEvidenceUpload = async (file: File, description: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const fileExtension = file.name.split(".").pop() || "pdf";
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const sanitizedName = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ""));
      const fileName = `${user.id}/${reportId}/project_${uniqueId}_${sanitizedName}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store only the path, not public URL (bucket is now private)
      setEvidences([...evidences, { url: fileName, description }]);
      toast.success("Evidencia subida correctamente");
    } catch (error: any) {
      toast.error("Error al subir evidencia", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleEvidenceDelete = async (index: number) => {
    const newEvidences = evidences.filter((_, i) => i !== index);
    setEvidences(newEvidences);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newEvidences = [...evidences];
    newEvidences[index].description = description;
    setEvidences(newEvidences);
  };

  const handleSave = () => {
    if (!relatedProjectId) {
      toast.error("Error", { description: "Seleccione el proyecto vinculado" });
      return;
    }

    if (!proposalType) {
      toast.error("Error", { description: "Seleccione el tipo de propuesta" });
      return;
    }

    if (teamMembers.length === 0) {
      toast.error("Error", { description: "Seleccione al menos un investigador del equipo" });
      return;
    }

    if (!projectRoles.director || !projectRoles.principal) {
      toast.error("Error", { description: "Seleccione director e investigador principal" });
      return;
    }

    if (evidences.length === 0) {
      toast.error("Error", { description: "Debe subir al menos una evidencia" });
      return;
    }

    const missingDescriptions = evidences.some(e => !e.description.trim());
    if (missingDescriptions) {
      toast.error("Error", { description: "Todas las evidencias deben tener descripción" });
      return;
    }

    onSave({
      id: existingEntry?.id,
      related_project_id: relatedProjectId,
      proposal_type: proposalType,
      team_members: teamMembers,
      project_roles: projectRoles,
      evidences,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingEntry ? "Editar" : "Agregar"} Proyecto I+D+i
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Link */}
          <ProjectSelector
            value={relatedProjectId}
            onChange={setRelatedProjectId}
            required
          />

          {/* Project Details */}
          <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
            <h4 className="font-semibold text-sm">Detalles del Proyecto</h4>
            
            <div>
              <Label>Tipo de Propuesta *</Label>
              <Select value={proposalType} onValueChange={setProposalType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Investigación Científica">Investigación Científica</SelectItem>
                  <SelectItem value="Desarrollo Tecnológico">Desarrollo Tecnológico</SelectItem>
                  <SelectItem value="Innovación">Innovación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Equipo Investigador *</Label>
              <MultiSelect
                options={profileOptions}
                selected={teamMembers}
                onChange={setTeamMembers}
                placeholder="Seleccione miembros del equipo"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Director del Proyecto *</Label>
                <Select
                  value={projectRoles.director}
                  onValueChange={(value) => 
                    setProjectRoles({ ...projectRoles, director: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Investigador Principal *</Label>
                <Select
                  value={projectRoles.principal}
                  onValueChange={(value) => 
                    setProjectRoles({ ...projectRoles, principal: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Evidence Upload */}
          <EvidenceUploader
            evidences={evidences}
            onUpload={handleEvidenceUpload}
            onDelete={handleEvidenceDelete}
            onDescriptionChange={handleDescriptionChange}
            uploading={uploading}
            maxFiles={10}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
