import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface PatenteEntry {
  id?: string;
  description: string;
  fase: "primera" | "segunda" | "tercera";
  monto?: number;
  porcentaje_ejecucion?: number;
  evidences: Array<{ url: string; description: string }>;
}

interface PatenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: PatenteEntry) => void;
  editingEntry?: PatenteEntry | null;
  reportId: string;
}

export default function PatenteDialog({
  open,
  onOpenChange,
  onSave,
  editingEntry,
  reportId,
}: PatenteDialogProps) {
  const [description, setDescription] = useState(editingEntry?.description || "");
  const [fase, setFase] = useState<"primera" | "segunda" | "tercera">(editingEntry?.fase || "primera");
  const [monto, setMonto] = useState(editingEntry?.monto?.toString() || "");
  const [porcentaje, setPorcentaje] = useState(editingEntry?.porcentaje_ejecucion?.toString() || "");
  const [evidences, setEvidences] = useState<Array<{ url: string; description: string }>>(
    editingEntry?.evidences || []
  );
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Error", { description: "Solo se permiten archivos PDF" });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const sanitizedName = file.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.]/gi, "_")
        .toLowerCase();
      
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const fileName = `${user.id}/${reportId}/patente/${uniqueId}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evaluation-evidence")
        .getPublicUrl(fileName);

      const newEvidence = { url: publicUrl, description: "" };
      setEvidences([...evidences, newEvidence]);

      toast.success("Archivo cargado correctamente");
    } catch (error: any) {
      toast.error("Error al subir archivo", { description: error.message });
    } finally {
      setUploading(false);
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
    if (!description.trim()) {
      toast.error("Error", { description: "Debe ingresar una descripción del proyecto/patente" });
      return;
    }
    if (evidences.length === 0) {
      toast.error("Error", { description: "Debe subir al menos un documento de la patente" });
      return;
    }

    onSave({
      id: editingEntry?.id,
      description,
      fase,
      monto: monto ? parseFloat(monto) : undefined,
      porcentaje_ejecucion: porcentaje ? parseInt(porcentaje) : undefined,
      evidences,
    });

    // Reset form
    setDescription("");
    setFase("primera");
    setMonto("");
    setPorcentaje("");
    setEvidences([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Editar Patente" : "Agregar Patente"}
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900 dark:text-red-100">
            ⚠ Advertencia: Todos los documentos de propiedad intelectual deben estar debidamente legalizados antes de subir.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <Label htmlFor="description">
              Descripción del Proyecto/Patente <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el proyecto o patente de forma detallada..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="fase">
              Fase <span className="text-destructive">*</span>
            </Label>
            <Select value={fase} onValueChange={(v) => setFase(v as "primera" | "segunda" | "tercera")}>
              <SelectTrigger id="fase">
                <SelectValue placeholder="Seleccione la fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primera">Primera Fase - Solicitud</SelectItem>
                <SelectItem value="segunda">Segunda Fase - Aprobación</SelectItem>
                <SelectItem value="tercera">Tercera Fase - Explotación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monto">Monto (USD) (Opcional)</Label>
              <Input
                id="monto"
                type="number"
                min="0"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="porcentaje">Porcentaje de Ejecución (Opcional)</Label>
              <Input
                id="porcentaje"
                type="number"
                min="0"
                max="100"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>
              Documento de Patente <span className="text-destructive">*</span>
            </Label>
            <div className="mt-2 space-y-2">
              {evidences.map((evidence, index) => (
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
                      onChange={(e) => updateDescription(index, e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidence(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".pdf";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload(file);
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Subiendo..." : "Subir Documento"}
              </Button>
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
