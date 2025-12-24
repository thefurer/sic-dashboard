import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ProjectSelector from "./ProjectSelector";
import { supabase } from "@/integrations/supabase/client";

export interface ConvocatoriaEntry {
  id?: string;
  related_project_id: string;
  entity_type: "interna" | "externa";
  entity_name: string;
  description: string;
  amount: number;
  evidences: Array<{ url: string; description: string; type: string }>;
}

interface ConvocatoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: ConvocatoriaEntry) => void;
  editingEntry?: ConvocatoriaEntry | null;
  reportId: string;
  type: "internacional" | "nacional";
}

export default function ConvocatoriaDialog({
  open,
  onOpenChange,
  onSave,
  editingEntry,
  reportId,
  type,
}: ConvocatoriaDialogProps) {
  const [projectId, setProjectId] = useState(editingEntry?.related_project_id || "");
  const [entityType, setEntityType] = useState<"interna" | "externa">(editingEntry?.entity_type || "interna");
  const [entityName, setEntityName] = useState(editingEntry?.entity_name || "");
  const [description, setDescription] = useState(editingEntry?.description || "");
  const [amount, setAmount] = useState(editingEntry?.amount?.toString() || "");
  const [evidences, setEvidences] = useState<Array<{ url: string; description: string; type: string }>>(
    editingEntry?.evidences || []
  );
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (file: File, evidenceType: string) => {
    if (!file.type.includes("pdf")) {
      toast.error("Error", { description: "Solo se permiten archivos PDF" });
      return;
    }

    setUploading(evidenceType);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const sanitizedName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.]/gi, "_")
        .toLowerCase();
      
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const fileName = `${user.id}/${reportId}/convocatoria_${type}/${uniqueId}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store only the path, not public URL (bucket is now private)
      const newEvidence = { url: fileName, description: "", type: evidenceType };
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
    if (!entityName.trim()) {
      toast.error("Error", { description: "Debe ingresar el nombre de la entidad" });
      return;
    }
    if (!description.trim()) {
      toast.error("Error", { description: "Debe ingresar una descripción" });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Error", { description: "Debe ingresar un monto válido" });
      return;
    }

    const certificaciones = evidences.filter(e => e.type === "certificacion");
    const convenios = evidences.filter(e => e.type === "convenio");

    if (certificaciones.length === 0) {
      toast.error("Error", { description: "Debe subir al menos una certificación" });
      return;
    }
    if (convenios.length === 0) {
      toast.error("Error", { description: "Debe subir el convenio firmado" });
      return;
    }

    onSave({
      id: editingEntry?.id,
      related_project_id: projectId,
      entity_type: entityType,
      entity_name: entityName,
      description,
      amount: parseFloat(amount),
      evidences,
    });

    // Reset form
    setProjectId("");
    setEntityType("interna");
    setEntityName("");
    setDescription("");
    setAmount("");
    setEvidences([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Editar" : "Agregar"} Convocatoria {type === "internacional" ? "Internacional" : "Nacional"}
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
            <Label>
              Tipo de Entidad <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={entityType} onValueChange={(v) => setEntityType(v as "interna" | "externa")} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interna" id="interna" />
                <Label htmlFor="interna" className="font-normal cursor-pointer">
                  Entidad Interna
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="externa" id="externa" />
                <Label htmlFor="externa" className="font-normal cursor-pointer">
                  ONG/Externa
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="entity-name">
              Nombre de la Entidad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="entity-name"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Ej: Fundación de Ciencia y Tecnología"
            />
          </div>

          <div>
            <Label htmlFor="description">
              Descripción de la Convocatoria <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa brevemente el objetivo y alcance de la convocatoria..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="amount">
              Monto Asignado (USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-4">
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
              <Label>
                Convenio Firmado <span className="text-destructive">*</span>
              </Label>
              <div className="mt-2 space-y-2">
                {evidences
                  .filter((e) => e.type === "convenio")
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
                  disabled={uploading === "convenio" || evidences.some(e => e.type === "convenio")}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(file, "convenio");
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading === "convenio" ? "Subiendo..." : "Subir Convenio"}
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
