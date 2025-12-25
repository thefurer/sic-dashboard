import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link as LinkIcon } from "lucide-react";

interface TaskEvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onSuccess: () => void;
}

export function TaskEvidenceModal({ open, onOpenChange, task, onSuccess }: TaskEvidenceModalProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [evidenceDescription, setEvidenceDescription] = useState(task?.evidence_description || "");
  const [evidenceLink, setEvidenceLink] = useState(task?.evidence_link || "");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${task.id}_${Date.now()}.${fileExt}`;
      // Use the task owner's user_id for the path to satisfy RLS policy
      const filePath = `${task.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Return just the path, not the public URL (bucket is now private)
      return filePath;
    } catch (error: any) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      let evidenceUrl = task?.evidence_url;
      
      // Upload file if selected
      if (evidenceFile) {
        evidenceUrl = await handleFileUpload(evidenceFile);
      }

      // Update task
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Subir Evidencia</DialogTitle>
          <DialogDescription>
            Sube la evidencia de cumplimiento para: {task?.planning_activities?.activity}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Archivo de Evidencia</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {task?.evidence_url && !evidenceFile && (
              <p className="text-xs text-muted-foreground">
                Ya existe un archivo. Sube uno nuevo para reemplazarlo.
              </p>
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
            <Textarea
              id="description"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="Describe brevemente la evidencia..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || (!evidenceFile && !task?.evidence_url)}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Subiendo..." : "Enviar Evidencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
