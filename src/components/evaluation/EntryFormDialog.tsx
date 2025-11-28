import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDOIMetadata } from "@/hooks/useDOIMetadata";
import { useISBNMetadata } from "@/hooks/useISBNMetadata";

export type IndicatorType = "Artículos JCR/Scopus" | "Libros Científicos" | "Artículos Regionales" | "Ponencias";

export interface EntryData {
  id?: string;
  project_type: string;
  metadata: Record<string, any>;
  files: {
    producto?: { url: string; name: string };
    pares?: { url: string; name: string };
    aceptacion?: { url: string; name: string };
    publicacion?: { url: string; name: string };
  };
}

interface EntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EntryData) => void;
  indicatorType: IndicatorType;
  reportId: string;
  existingEntry?: EntryData;
}

export default function EntryFormDialog({
  open,
  onClose,
  onSave,
  indicatorType,
  reportId,
  existingEntry,
}: EntryFormDialogProps) {
  const [projectType, setProjectType] = useState(existingEntry?.project_type || "");
  const [metadata, setMetadata] = useState<Record<string, any>>(existingEntry?.metadata || {});
  const [files, setFiles] = useState<EntryData["files"]>(existingEntry?.files || {});
  const [uploading, setUploading] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const { fetchMetadata: fetchDOI, isLoading: loadingDOI } = useDOIMetadata();
  const { fetchMetadata: fetchISBN, isLoading: loadingISBN } = useISBNMetadata();

  const isPonencias = indicatorType === "Ponencias";
  const isArticle = indicatorType.includes("Artículos");
  const isBook = indicatorType === "Libros Científicos";

  const sanitizeFilename = (filename: string): string => {
    return filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9._-]/gi, "_")
      .toLowerCase();
  };

  const handleFileUpload = async (fileType: string, file: File) => {
    setUploading(fileType);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const fileExtension = file.name.split(".").pop() || "pdf";
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const sanitizedName = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ""));
      const fileName = `${user.id}/${reportId}/${fileType}_${uniqueId}_${sanitizedName}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evaluation-evidence")
        .getPublicUrl(fileName);

      setFiles({
        ...files,
        [fileType]: { url: publicUrl, name: file.name },
      });

      toast.success("Archivo subido correctamente");
    } catch (error: any) {
      toast.error("Error al subir archivo", { description: error.message });
    } finally {
      setUploading(null);
    }
  };

  const handleSmartSearch = async () => {
    if (isBook) {
      const result = await fetchISBN(searchValue);
      if (result) {
        setMetadata({
          title: result.title,
          authors: result.authors,
          editorial: result.editorial,
          year: result.year,
          isbn: result.isbn,
        });
      }
    } else if (isArticle) {
      const result = await fetchDOI(searchValue);
      if (result) {
        setMetadata({
          title: result.title,
          authors: result.authors,
          journal: result.journal,
          year: result.year,
          issn: result.issn,
          doi: searchValue,
        });
      }
    }
  };

  const handleVerifyMIAR = () => {
    const issn = metadata.issn;
    if (!issn) {
      toast.error("ISSN no disponible", { description: "Realice la búsqueda DOI primero" });
      return;
    }
    window.open(`https://miar.ub.edu/buscar/${issn}`, "_blank");
  };

  const handleSave = () => {
    if (!projectType) {
      toast.error("Error", { description: "Seleccione el tipo de proyecto" });
      return;
    }

    const requiredFiles: (keyof EntryData["files"])[] = isPonencias
      ? ["producto", "aceptacion", "publicacion"]
      : ["producto", "pares", "aceptacion", "publicacion"];

    const missingFiles = requiredFiles.filter(f => !files[f]);
    if (missingFiles.length > 0) {
      toast.error("Faltan evidencias", {
        description: `Debe subir: ${missingFiles.map(f => {
          switch(f) {
            case "producto": return "Producto publicado";
            case "pares": return "Evaluación por pares";
            case "aceptacion": return "Certificado de aceptación";
            case "publicacion": return "Certificado de publicación";
            default: return f;
          }
        }).join(", ")}`,
      });
      return;
    }

    onSave({
      id: existingEntry?.id,
      project_type: projectType,
      metadata,
      files,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingEntry ? "Editar" : "Agregar"} {indicatorType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Smart Search */}
          {(isArticle || isBook) && (
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
              <Label className="text-sm font-medium mb-2 block">
                {isBook ? "Búsqueda Inteligente ISBN" : "Búsqueda Inteligente DOI"}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={isBook ? "978-84-1234-567-8" : "10.1234/example.2024"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={handleSmartSearch}
                  disabled={loadingDOI || loadingISBN}
                  size="sm"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
              {metadata.title && (
                <div className="mt-3 p-3 bg-background rounded text-xs space-y-1">
                  <p><strong>Título:</strong> {metadata.title}</p>
                  <p><strong>Autores:</strong> {metadata.authors}</p>
                  {metadata.journal && <p><strong>Revista:</strong> {metadata.journal}</p>}
                  {metadata.editorial && <p><strong>Editorial:</strong> {metadata.editorial}</p>}
                </div>
              )}
            </div>
          )}

          {/* MIAR Verification for Regional Articles */}
          {indicatorType === "Artículos Regionales" && metadata.issn && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyMIAR}
              className="w-full"
            >
              Verificar en MIAR
            </Button>
          )}

          {/* Optional Link Field for Books */}
          {isBook && (
            <div>
              <Label>Enlace (Opcional)</Label>
              <Input
                value={metadata.link || ""}
                onChange={(e) => setMetadata({ ...metadata, link: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          )}

          {/* Project Type */}
          <div>
            <Label>Tipo de Proyecto *</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Investigación">Investigación</SelectItem>
                <SelectItem value="Vinculación">Vinculación</SelectItem>
                <SelectItem value="Ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota Importante:</strong> Todos los documentos subidos deben estar debidamente legalizados.
            </AlertDescription>
          </Alert>

          {/* Evidence Uploads */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Evidencias Requeridas</Label>
            
            {/* Producto Publicado */}
            <FileUploadBox
              label="Evidencia del producto publicado *"
              file={files.producto}
              onUpload={(file) => handleFileUpload("producto", file)}
              onRemove={() => setFiles({ ...files, producto: undefined })}
              uploading={uploading === "producto"}
            />

            {/* Evaluación por Pares */}
            <FileUploadBox
              label={`Evaluación por pares ${isPonencias ? "(Opcional)" : "*"}`}
              file={files.pares}
              onUpload={(file) => handleFileUpload("pares", file)}
              onRemove={() => setFiles({ ...files, pares: undefined })}
              uploading={uploading === "pares"}
            />

            {/* Certificado Aceptación */}
            <FileUploadBox
              label="Certificado de aceptación *"
              file={files.aceptacion}
              onUpload={(file) => handleFileUpload("aceptacion", file)}
              onRemove={() => setFiles({ ...files, aceptacion: undefined })}
              uploading={uploading === "aceptacion"}
            />

            {/* Certificado Publicación */}
            <FileUploadBox
              label="Certificado de publicación *"
              file={files.publicacion}
              onUpload={(file) => handleFileUpload("publicacion", file)}
              onRemove={() => setFiles({ ...files, publicacion: undefined })}
              uploading={uploading === "publicacion"}
            />
          </div>
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

interface FileUploadBoxProps {
  label: string;
  file?: { url: string; name: string };
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}

function FileUploadBox({ label, file, onUpload, onRemove, uploading }: FileUploadBoxProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes("pdf")) {
        toast.error("Solo se permiten archivos PDF");
        return;
      }
      onUpload(selectedFile);
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-muted/30">
      <Label className="text-sm mb-2 block">{label}</Label>
      {!file ? (
        <div>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${label}`}
            disabled={uploading}
          />
          <Label
            htmlFor={`upload-${label}`}
            className="cursor-pointer flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded hover:bg-muted/50 transition-colors"
          >
            {uploading ? (
              <span className="text-sm text-muted-foreground">Subiendo...</span>
            ) : (
              <>
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click para seleccionar PDF</span>
              </>
            )}
          </Label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 bg-background rounded">
          <div className="flex items-center gap-2 flex-1">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm truncate">{file.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
