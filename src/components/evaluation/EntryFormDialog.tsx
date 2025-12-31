import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, AlertTriangle, Search, Sparkles } from "lucide-react";
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
  const [autoDetected, setAutoDetected] = useState(false);

  const { fetchMetadata: fetchDOI, isLoading: loadingDOI } = useDOIMetadata();
  const { fetchMetadata: fetchISBN, isLoading: loadingISBN } = useISBNMetadata();

  const isPonencias = indicatorType === "Ponencias";
  const isArticle = indicatorType.includes("Artículos");
  const isBook = indicatorType === "Libros Científicos";

  // Reset form when dialog opens with new entry or populate when editing
  useEffect(() => {
    if (open) {
      if (existingEntry) {
        setProjectType(existingEntry.project_type);
        setMetadata(existingEntry.metadata);
        setFiles(existingEntry.files);
      } else {
        setProjectType("");
        setMetadata({});
        setFiles({});
        setSearchValue("");
        setAutoDetected(false);
      }
    }
  }, [open, existingEntry]);

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

      // Store only the path, not public URL (bucket is now private)
      setFiles({
        ...files,
        [fileType]: { url: fileName, name: file.name },
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
        setAutoDetected(true);
      }
    } else if (isArticle) {
      const result = await fetchDOI(searchValue);
      if (result) {
        const newMetadata: Record<string, any> = {
          title: result.title,
          authors: result.authors,
          journal: result.journal,
          year: result.year,
          issn: result.issn,
          doi: searchValue,
        };
        
        // Auto-detect repository based on journal/publisher
        if (indicatorType === "Artículos JCR/Scopus") {
          const journalLower = result.journal?.toLowerCase() || "";
          if (journalLower.includes("elsevier") || journalLower.includes("springer") || 
              journalLower.includes("ieee") || journalLower.includes("wiley")) {
            newMetadata.repository = "Scopus";
          } else if (journalLower.includes("clarivate")) {
            newMetadata.repository = "ISI Web of Knowledge";
          }
        }
        
        setMetadata(newMetadata);
        setAutoDetected(true);
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

  const handleVerifyScimago = () => {
    const issn = metadata.issn;
    if (!issn) {
      toast.error("ISSN no disponible", { description: "Realice la búsqueda DOI primero" });
      return;
    }
    window.open(`https://www.scimagojr.com/journalsearch.php?q=${issn}`, "_blank");
  };

  const handleSave = () => {
    if (!projectType) {
      toast.error("Error", { description: "Seleccione el tipo de proyecto" });
      return;
    }

    // Validate required metadata fields
    if (!metadata.title || !metadata.authors || !metadata.year) {
      toast.error("Campos requeridos", {
        description: "Complete Título, Autores y Año",
      });
      return;
    }

    if (isArticle && !metadata.journal) {
      toast.error("Campo requerido", {
        description: "Complete el nombre de la Revista",
      });
      return;
    }

    // At least one evidence file must be uploaded
    if (!files.producto && !files.pares && !files.aceptacion && !files.publicacion) {
      toast.error("Evidencia requerida", {
        description: "Debe subir al menos un archivo de evidencia",
      });
      return;
    }

    onSave({
      id: existingEntry?.id,
      project_type: projectType,
      metadata,
      files,
    });
    
    // Close dialog after successful save
    onClose();
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
          {/* Smart Search - Optional (DOI for JCR/Scopus, ISBN for Books, MIAR ISSN for Regional Articles) */}
          {(isArticle || isBook) && indicatorType !== "Artículos Regionales" && (
            <>
              <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                <Label className="text-sm font-medium mb-2 block">
                  {isBook ? "Búsqueda Inteligente ISBN (Opcional)" : "Búsqueda Inteligente DOI (Opcional)"}
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
              <div className="border-t border-border" />
            </>
          )}

          {/* MIAR ISSN Search for Regional Articles */}
          {indicatorType === "Artículos Regionales" && (
            <>
              <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-500/5">
                <Label className="text-sm font-medium mb-2 block">
                  Verificación MIAR por ISSN (Opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="1234-5678"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!searchValue.trim()) {
                        toast.error("Ingrese un ISSN para buscar");
                        return;
                      }
                      setMetadata({ ...metadata, issn: searchValue.trim() });
                      window.open(`https://miar.ub.edu/issn/${searchValue.trim()}`, "_blank");
                    }}
                    size="sm"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar en MIAR
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ingrese el ISSN de la revista para verificar su indexación en MIAR
                </p>
              </div>
              <div className="border-t border-border" />
            </>
          )}

          {/* Verification Links */}
          {indicatorType === "Artículos JCR/Scopus" && metadata.issn && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyScimago}
              className="w-full"
            >
              Verificar en Scimago
            </Button>
          )}
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

          {/* Repository Selection for JCR Articles */}
          {indicatorType === "Artículos JCR/Scopus" && (
            <div>
              <Label>Indizado en *</Label>
              <Select 
                value={metadata.repository || ""} 
                onValueChange={(value) => {
                  setMetadata({ ...metadata, repository: value });
                  setAutoDetected(false);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione base de datos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scopus">Scopus</SelectItem>
                  <SelectItem value="ISI Web of Knowledge">ISI Web of Knowledge</SelectItem>
                  <SelectItem value="Latindex">Latindex (Catálogo)</SelectItem>
                  <SelectItem value="Scielo">Scielo</SelectItem>
                  <SelectItem value="Lilacs">Lilacs</SelectItem>
                  <SelectItem value="Redalyc">Redalyc</SelectItem>
                  <SelectItem value="Ebsco">Ebsco</SelectItem>
                  <SelectItem value="OAJI">OAJI</SelectItem>
                  <SelectItem value="Otras">Otras (CACES)</SelectItem>
                </SelectContent>
              </Select>
              {autoDetected && metadata.repository && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Auto-detectado
                </p>
              )}
            </div>
          )}

          {/* Metadata Fields - Always Visible */}
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input
                value={metadata.title || ""}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                placeholder="Ingrese el título"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Autores *</Label>
              <Input
                value={metadata.authors || ""}
                onChange={(e) => setMetadata({ ...metadata, authors: e.target.value })}
                placeholder="Ingrese los autores"
                className="mt-1"
              />
            </div>
            {isArticle && (
              <div>
                <Label>Revista *</Label>
                <Input
                  value={metadata.journal || ""}
                  onChange={(e) => setMetadata({ ...metadata, journal: e.target.value })}
                  placeholder="Nombre de la revista"
                  className="mt-1"
                />
              </div>
            )}
            {isBook && (
              <>
                <div>
                  <Label>Editorial</Label>
                  <Input
                    value={metadata.editorial || ""}
                    onChange={(e) => setMetadata({ ...metadata, editorial: e.target.value })}
                    placeholder="Editorial"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>ISBN</Label>
                  <Input
                    value={metadata.isbn || ""}
                    onChange={(e) => setMetadata({ ...metadata, isbn: e.target.value })}
                    placeholder="ISBN"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Enlace (Opcional)</Label>
                  <Input
                    value={metadata.link || ""}
                    onChange={(e) => setMetadata({ ...metadata, link: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </>
            )}
            <div>
              <Label>Año *</Label>
              <Input
                value={metadata.year || ""}
                onChange={(e) => setMetadata({ ...metadata, year: e.target.value })}
                placeholder="2024"
                className="mt-1"
              />
            </div>
          </div>

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
            {!isPonencias && (
              <FileUploadBox
                label="Evaluación por pares"
                file={files.pares}
                onUpload={(file) => handleFileUpload("pares", file)}
                onRemove={() => setFiles({ ...files, pares: undefined })}
                uploading={uploading === "pares"}
              />
            )}

            {/* Certificado Aceptación */}
            <FileUploadBox
              label="Certificado de aceptación"
              file={files.aceptacion}
              onUpload={(file) => handleFileUpload("aceptacion", file)}
              onRemove={() => setFiles({ ...files, aceptacion: undefined })}
              uploading={uploading === "aceptacion"}
            />

            {/* Certificado Publicación */}
            <FileUploadBox
              label="Certificado de publicación"
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
