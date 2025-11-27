import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2 } from "lucide-react";

export interface Evidence {
  url: string;
  description: string;
}

interface EvidenceUploaderProps {
  evidences: Evidence[];
  onUpload: (file: File, description: string) => Promise<void>;
  onDelete: (index: number) => void;
  onDescriptionChange: (index: number, description: string) => void;
  uploading?: boolean;
  maxFiles?: number;
}

export default function EvidenceUploader({
  evidences,
  onUpload,
  onDelete,
  onDescriptionChange,
  uploading,
  maxFiles = 5,
}: EvidenceUploaderProps) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingDescription, setPendingDescription] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes("pdf")) {
        alert("Solo se permiten archivos PDF");
        return;
      }
      setPendingFile(file);
    }
  };

  const handleUploadClick = async () => {
    if (!pendingFile) return;
    
    await onUpload(pendingFile, pendingDescription);
    setPendingFile(null);
    setPendingDescription("");
  };

  const canAddMore = evidences.length < maxFiles;

  return (
    <div className="space-y-3">
      <Label>Evidencias (PDF) *</Label>
      
      {/* Existing Evidences */}
      {evidences.map((evidence, index) => (
        <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => window.open(evidence.url, "_blank")}
              >
                Ver PDF #{index + 1}
              </Button>
            </div>
            <Input
              placeholder="Descripción de la evidencia"
              value={evidence.description}
              onChange={(e) => onDescriptionChange(index, e.target.value)}
              className="text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}

      {/* Upload New Evidence */}
      {canAddMore && (
        <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
          {!pendingFile ? (
            <div className="text-center">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="evidence-upload"
              />
              <Label
                htmlFor="evidence-upload"
                className="cursor-pointer flex flex-col items-center gap-2 py-4"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click para seleccionar PDF
                </span>
              </Label>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">{pendingFile.name}</p>
              <Input
                placeholder="Descripción de esta evidencia *"
                value={pendingDescription}
                onChange={(e) => setPendingDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUploadClick}
                  disabled={!pendingDescription.trim() || uploading}
                  size="sm"
                  className="flex-1"
                >
                  {uploading ? "Subiendo..." : "Confirmar Subida"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPendingFile(null);
                    setPendingDescription("");
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Máximo {maxFiles} evidencias. Cada archivo debe incluir una descripción.
      </p>
    </div>
  );
}
