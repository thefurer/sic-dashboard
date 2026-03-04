import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link as LinkIcon, FileText, Trash2, Plus } from "lucide-react";
import { openSignedUrl } from "@/hooks/useSignedUrl";

interface EvidenceFile {
  path: string;
  name: string;
}

interface TaskEvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onSuccess: () => void;
}

export function TaskEvidenceModal({ open, onOpenChange, task, onSuccess }: TaskEvidenceModalProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<EvidenceFile[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Load existing data when task changes
  useEffect(() => {
    if (task) {
      setEvidenceDescription(task.evidence_description || "");
      setEvidenceLink(task.evidence_link || "");
      // Parse existing evidence_url - could be a single path or JSON array
      if (task.evidence_url) {
        try {
          const parsed = JSON.parse(task.evidence_url);
          if (Array.isArray(parsed)) {
            setUploadedFiles(parsed);
          } else {
            setUploadedFiles([{ path: task.evidence_url, name: task.evidence_url.split("/").pop() || "archivo" }]);
          }
        } catch {
          setUploadedFiles([{ path: task.evidence_url, name: task.evidence_url.split("/").pop() || "archivo" }]);
        }
      } else {
        setUploadedFiles([]);
      }
    }
  }, [task]);

  const handleFileUpload = async (file: File): Promise<EvidenceFile> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${task.id}_${Date.now()}.${fileExt}`;
    const filePath = `${task.user_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("evaluation-evidence")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    return { path: filePath, name: file.name };
  };

  const handleAddFile = async () => {
    if (!pendingFile) return;
    try {
      setUploading(true);
      const uploaded = await handleFileUpload(pendingFile);
      setUploadedFiles(prev => [...prev, uploaded]);
      setPendingFile(null);
      toast({ title: "Archivo subido", description: `${pendingFile.name} agregado correctamente` });
    } catch (error: any) {
      toast({ title: "Error al subir archivo", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (index: number) => {
    const file = uploadedFiles[index];
    // Try to delete from storage
    try {
      await supabase.storage.from("evaluation-evidence").remove([file.path]);
    } catch {
      // Ignore storage deletion errors
    }
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast({ title: "Error", description: "Debes subir al menos un archivo de evidencia", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);

      const evidenceUrl = JSON.stringify(uploadedFiles);

      const { error } = await supabase
        .from("assigned_tasks")
        .update({
          evidence_url: evidenceUrl,
          evidence_description: evidenceDescription,
          evidence_link: evidenceLink || null,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Evidencia enviada",
        description: "Tu evidencia ha sido enviada para revisión",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Evidencia</DialogTitle>
          <DialogDescription>
            Sube la evidencia de cumplimiento para: {task?.planning_activities?.activity}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Uploaded Files List */}
          <div className="space-y-2">
            <Label>Archivos de Evidencia ({uploadedFiles.length})</Label>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs flex-1 justify-start truncate"
                  onClick={() => openSignedUrl("evaluation-evidence", file.path)}
                >
                  {file.name}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => handleRemoveFile(index)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New File */}
          <div className="border-2 border-dashed rounded-lg p-3 space-y-2">
            {!pendingFile ? (
              <div className="text-center">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="task-evidence-upload"
                />
                <Label
                  htmlFor="task-evidence-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 py-3"
                >
                  <Plus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Agregar archivo de evidencia
                  </span>
                </Label>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium truncate">{pendingFile.name}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddFile}
                    disabled={uploading}
                    size="sm"
                    className="flex-1"
                  >
                    {uploading ? "Subiendo..." : "Confirmar Subida"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingFile(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              Enlace Externo (Opcional)
            </Label>
            <Input
              id="link"
              type="url"
              value={evidenceLink}
              onChange={(e) => setEvidenceLink(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <SmartTextarea
              id="description"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="Describe brevemente la evidencia..."
              rows={4}
              storageKey="user-evidence-descriptions"
              quickSuggestions={[
                "Documento de evidencia que respalda la actividad realizada.",
                "Informe de avance correspondiente al período establecido.",
                "Acta de reunión con los participantes involucrados.",
                "Certificado de participación en el evento.",
                "Capturas de pantalla del sistema/plataforma utilizada.",
                "Lista de asistencia firmada por los participantes.",
                "Fotografías del evento/actividad realizada.",
              ]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || uploadedFiles.length === 0}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Subiendo..." : "Enviar Evidencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
