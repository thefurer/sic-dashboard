import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, ExternalLink, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface ProjectDocument {
  url: string;
  name: string;
  uploaded_at: string;
  [key: string]: string; // Index signature for Json compatibility
}

export default function OfficialProjects() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["official-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("official_projects")
        .select("*")
        .order("year", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ projectId, file, name, currentDocs }: { 
      projectId: string; 
      file: File; 
      name: string;
      currentDocs: ProjectDocument[];
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `project-docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('institutional-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('institutional-docs')
        .getPublicUrl(filePath);

      const newDoc: ProjectDocument = {
        url: publicUrl,
        name: name || file.name,
        uploaded_at: new Date().toISOString()
      };

      const updatedDocs = [...currentDocs, newDoc];

      const { error: updateError } = await supabase
        .from("official_projects")
        .update({ 
          documents: updatedDocs,
          project_document_url: updatedDocs[0]?.url || null
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      return updatedDocs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Documento subido correctamente");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentName("");
    },
    onError: (error: any) => {
      toast.error("Error al subir el documento", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ projectId, docIndex, currentDocs }: { 
      projectId: string; 
      docIndex: number;
      currentDocs: ProjectDocument[];
    }) => {
      const updatedDocs = currentDocs.filter((_, i) => i !== docIndex);

      const { error } = await supabase
        .from("official_projects")
        .update({ 
          documents: updatedDocs,
          project_document_url: updatedDocs[0]?.url || null
        })
        .eq("id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Documento eliminado");
    },
    onError: (error: any) => {
      toast.error("Error al eliminar", { description: error.message });
    },
  });

  const handleUploadClick = (project: any) => {
    setSelectedProject(project);
    setIsUploadDialogOpen(true);
  };

  const handleViewDocs = (project: any) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProject) return;
    setUploading(true);
    const currentDocs = (selectedProject.documents as ProjectDocument[]) || [];
    await uploadMutation.mutateAsync({ 
      projectId: selectedProject.id, 
      file: selectedFile,
      name: documentName,
      currentDocs
    });
    setUploading(false);
  };

  const handleDeleteDoc = (docIndex: number) => {
    if (!selectedProject) return;
    if (confirm("¿Eliminar este documento?")) {
      const currentDocs = (selectedProject.documents as ProjectDocument[]) || [];
      deleteMutation.mutate({
        projectId: selectedProject.id,
        docIndex,
        currentDocs
      });
      // Update local state
      const updatedDocs = currentDocs.filter((_, i) => i !== docIndex);
      setSelectedProject({ ...selectedProject, documents: updatedDocs });
    }
  };

  const getDocuments = (project: any): ProjectDocument[] => {
    if (Array.isArray(project.documents)) {
      return project.documents;
    }
    // Fallback for old format
    if (project.project_document_url) {
      return [{ url: project.project_document_url, name: 'Documento', uploaded_at: project.created_at }];
    }
    return [];
  };

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Proyectos Oficiales</h1>
        <p className="text-muted-foreground mt-1">
          Lista de proyectos I+D+i oficiales vinculados a las evaluaciones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Proyecto</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead className="text-right">Documentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const docs = getDocuments(project);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.year}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {docs.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDocs(project)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Ver ({docs.length})
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadClick(project)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay proyectos registrados.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        setIsUploadDialogOpen(open);
        if (!open) {
          setSelectedFile(null);
          setDocumentName("");
          setSelectedProject(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="docName">Nombre del Documento</Label>
              <Input
                id="docName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Ej: Propuesta de Proyecto"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="document">Archivo (PDF)</Label>
              <Input
                id="document"
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1 cursor-pointer"
              />
            </div>
            <Button 
              onClick={handleUpload} 
              className="w-full" 
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Documents Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) setSelectedProject(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Documentos del Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto">
            {selectedProject && getDocuments(selectedProject).map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDoc(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {selectedProject && getDocuments(selectedProject).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay documentos
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => {
              setIsViewDialogOpen(false);
              handleUploadClick(selectedProject);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Documento
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
