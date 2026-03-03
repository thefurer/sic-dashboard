import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";

export interface VinculacionEntry {
  id?: string;
  related_project_id: string;
  project_name: string;
  evidences: Array<{ url: string; description: string; type: string }>;
}

interface VinculacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: VinculacionEntry) => void;
  editingEntry?: VinculacionEntry | null;
  reportId: string;
}

export default function VinculacionDialog({
  open,
  onOpenChange,
  onSave,
  editingEntry,
  reportId,
}: VinculacionDialogProps) {
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [evidences, setEvidences] = useState<Array<{ url: string; description: string; type: string }>>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  // Reset form when dialog opens/closes or editingEntry changes
  useEffect(() => {
    if (open) {
      setProjectId(editingEntry?.related_project_id || "");
      setProjectName(editingEntry?.project_name || "");
      setEvidences(editingEntry?.evidences || []);
    }
  }, [open, editingEntry]);

  const handleFileUpload = async (file: File, type: string) => {
    if (!file.type.includes("pdf")) {
      toast.error("Error", { description: "Solo se permiten archivos PDF" });
      return;
    }

    setUploading(type);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const sanitizedName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.]/gi, "_")
        .toLowerCase();
      
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const fileName = `${user.id}/${reportId}/vinculacion/${uniqueId}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store only the path, not public URL (bucket is now private)
      const newEvidence = { url: fileName, description: "", type };
      setEvidences([...evidences, newEvidence]);

      toast.success("Archivo cargado correctamente");
    } catch (error: any) {
      toast.error("Error al subir archivo", { description: error.message });
    } finally {
      setUploading(null);
    }
  };

  const updateDescription = (index: number, description: string) => {
    const updated = [...evidences];
    updated[index].description = description;
    setEvidences(updated);
  };

  const removeEvidence = (index: number) => {
    setEvidences(evidences.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!projectId) {
      toast.error("Error", { description: "Debe seleccionar un proyecto vinculado" });
      return;
    }
    if (!projectName.trim()) {
      toast.error("Error", { description: "Debe ingresar el nombre del proyecto de vinculación" });
      return;
    }

    const principalEvidence = evidences.filter(e => e.type === "principal");
    const certificaciones = evidences.filter(e => e.type === "certificacion");

    if (principalEvidence.length === 0) {
      toast.error("Error", { description: "Debe subir la evidencia principal" });
      return;
    }
    if (certificaciones.length === 0) {
      toast.error("Error", { description: "Debe subir al menos una certificación" });
      return;
    }

    onSave({
      id: editingEntry?.id,
      related_project_id: projectId,
      project_name: projectName,
      evidences,
    });

    // Reset form
    setProjectId("");
    setProjectName("");
    setEvidences([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Editar Proyecto de Vinculación" : "Agregar Proyecto de Vinculación"}
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            ⚠ Nota Importante: Todos los documentos subidos deben estar debidamente legalizados.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <ProjectSelector value={projectId} onChange={setProjectId} required />

          <div>
            <Label htmlFor="project-name">
              Nombre del Proyecto de Vinculación <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ej: Capacitación en tecnologías emergentes para comunidades rurales"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>
                Evidencia Principal <span className="text-destructive">*</span>
              </Label>
              <div className="mt-2 space-y-2">
                {evidences
                  .filter((e) => e.type === "principal")
                  .map((evidence, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                      <FileText className="w-4 h-4 mt-1 text-primary" />
                      <div className="flex-1 space-y-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => window.open(evidence.url, "_blank")}
                        >
                          Ver documento
                        </Button>
                        <Input
                          placeholder="Descripción de la evidencia *"
                          value={evidence.description}
                          onChange={(e) => updateDescription(
                            evidences.findIndex((ev) => ev === evidence),
                            e.target.value
                          )}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvidence(evidences.findIndex((ev) => ev === evidence))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading === "principal" || evidences.some(e => e.type === "principal")}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(file, "principal");
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading === "principal" ? "Subiendo..." : "Subir Evidencia Principal"}
                </Button>
              </div>
            </div>

            <div>
              <Label>
                Certificaciones <span className="text-destructive">*</span>
              </Label>
              <div className="mt-2 space-y-2">
                {evidences
                  .filter((e) => e.type === "certificacion")
                  .map((evidence, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                      <FileText className="w-4 h-4 mt-1 text-primary" />
                      <div className="flex-1 space-y-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => window.open(evidence.url, "_blank")}
                        >
                          Ver documento
                        </Button>
                        <Input
                          placeholder="Descripción de la evidencia *"
                          value={evidence.description}
                          onChange={(e) => updateDescription(
                            evidences.findIndex((ev) => ev === evidence),
                            e.target.value
                          )}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvidence(evidences.findIndex((ev) => ev === evidence))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading === "certificacion"}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(file, "certificacion");
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading === "certificacion" ? "Subiendo..." : "Subir Certificación"}
                </Button>
              </div>
            </div>

            <div>
              <Label>Otras Evidencias (Opcional)</Label>
              <div className="mt-2 space-y-2">
                {evidences
                  .filter((e) => e.type === "otras")
                  .map((evidence, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                      <FileText className="w-4 h-4 mt-1 text-primary" />
                      <div className="flex-1 space-y-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm"
                          onClick={() => window.open(evidence.url, "_blank")}
                        >
                          Ver documento
                        </Button>
                        <Input
                          placeholder="Descripción de la evidencia"
                          value={evidence.description}
                          onChange={(e) => updateDescription(
                            evidences.findIndex((ev) => ev === evidence),
                            e.target.value
                          )}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvidence(evidences.findIndex((ev) => ev === evidence))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading === "otras"}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(file, "otras");
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading === "otras" ? "Subiendo..." : "Subir Otra Evidencia"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
