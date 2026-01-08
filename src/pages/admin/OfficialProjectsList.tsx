import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, ExternalLink, Upload } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface ProjectDocument {
  url: string;
  name: string;
  uploaded_at: string;
  [key: string]: string; // Index signature for Json compatibility
}

export default function OfficialProjectsList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDocsDialogOpen, setIsDocsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [projectYear, setProjectYear] = useState(new Date().getFullYear());
  const [projectFile, setProjectFile] = useState<File | null>(null);
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

  const saveMutation = useMutation({
    mutationFn: async (data: { id?: string; name: string; year: number; file?: File | null; docName?: string }) => {
      let documents: ProjectDocument[] = [];

      // Upload file if provided for new project
      if (data.file && !data.id) {
        const fileExt = data.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `project-docs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('institutional-docs')
          .upload(filePath, data.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('institutional-docs')
          .getPublicUrl(filePath);

        documents = [{
          url: urlData.publicUrl,
          name: data.docName || data.file.name,
          uploaded_at: new Date().toISOString()
        }];
      }

      if (data.id) {
        const { error } = await supabase
          .from("official_projects")
          .update({ 
            name: data.name, 
            year: data.year, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("official_projects")
          .insert({ 
            name: data.name, 
            year: data.year,
            documents: documents as unknown as Json,
            project_document_url: documents[0]?.url || null
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Proyecto guardado correctamente");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Error al guardar", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("official_projects")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Proyecto eliminado");
    },
    onError: (error: any) => {
      toast.error("Error al eliminar", { description: error.message });
    },
  });

  const uploadDocMutation = useMutation({
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
          documents: updatedDocs as unknown as Json,
          project_document_url: updatedDocs[0]?.url || null
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      return updatedDocs;
    },
    onSuccess: (updatedDocs) => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Documento agregado");
      setProjectFile(null);
      setDocumentName("");
      if (viewingProject) {
        setViewingProject({ ...viewingProject, documents: updatedDocs });
      }
    },
    onError: (error: any) => {
      toast.error("Error al subir", { description: error.message });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: async ({ projectId, docIndex, currentDocs }: { 
      projectId: string; 
      docIndex: number;
      currentDocs: ProjectDocument[];
    }) => {
      const updatedDocs = currentDocs.filter((_, i) => i !== docIndex);

      const { error } = await supabase
        .from("official_projects")
        .update({ 
          documents: updatedDocs as unknown as Json,
          project_document_url: updatedDocs[0]?.url || null
        })
        .eq("id", projectId);

      if (error) throw error;
      return updatedDocs;
    },
    onSuccess: (updatedDocs) => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Documento eliminado");
      if (viewingProject) {
        setViewingProject({ ...viewingProject, documents: updatedDocs });
      }
    },
    onError: (error: any) => {
      toast.error("Error al eliminar", { description: error.message });
    },
  });

  const resetForm = () => {
    setProjectName("");
    setProjectYear(new Date().getFullYear());
    setProjectFile(null);
    setDocumentName("");
    setEditingProject(null);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectYear(project.year);
    setIsDialogOpen(true);
  };

  const handleViewDocs = (project: any) => {
    setViewingProject(project);
    setIsDocsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast.error("El nombre del proyecto es requerido");
      return;
    }

    setUploading(true);
    saveMutation.mutate({
      id: editingProject?.id,
      name: projectName,
      year: projectYear,
      file: !editingProject ? projectFile : null,
      docName: documentName
    });
    setUploading(false);
  };

  const handleUploadDoc = async () => {
    if (!projectFile || !viewingProject) return;
    setUploading(true);
    const currentDocs = (viewingProject.documents as ProjectDocument[]) || [];
    await uploadDocMutation.mutateAsync({
      projectId: viewingProject.id,
      file: projectFile,
      name: documentName,
      currentDocs
    });
    setUploading(false);
  };

  const handleDeleteDoc = (docIndex: number) => {
    if (!viewingProject) return;
    if (confirm("¿Eliminar este documento?")) {
      const currentDocs = (viewingProject.documents as ProjectDocument[]) || [];
      deleteDocMutation.mutate({
        projectId: viewingProject.id,
        docIndex,
        currentDocs
      });
    }
  };

  const getDocuments = (project: any): ProjectDocument[] => {
    if (Array.isArray(project.documents)) {
      return project.documents;
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Proyectos Oficiales</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los proyectos I+D+i activos para vincular en las evaluaciones
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ej: Desarrollo de plataforma IoT para agricultura"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  type="number"
                  value={projectYear}
                  onChange={(e) => setProjectYear(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              {!editingProject && (
                <>
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
                    <Label htmlFor="docFile">Documento del Proyecto (PDF)</Label>
                    <Input
                      id="docFile"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                      className="mt-1 cursor-pointer"
                    />
                  </div>
                </>
              )}
              <Button onClick={handleSave} className="w-full" disabled={saveMutation.isPending || uploading}>
                {saveMutation.isPending || uploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  <TableHead>Documentos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const docs = getDocuments(project);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.year}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocs(project)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {docs.length} documento{docs.length !== 1 ? 's' : ''}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(project)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("¿Eliminar este proyecto?")) {
                                deleteMutation.mutate(project.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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
              No hay proyectos registrados. Crea uno para comenzar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Documents Dialog */}
      <Dialog open={isDocsDialogOpen} onOpenChange={(open) => {
        setIsDocsDialogOpen(open);
        if (!open) {
          setViewingProject(null);
          setProjectFile(null);
          setDocumentName("");
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Documentos del Proyecto</DialogTitle>
          </DialogHeader>
          
          {/* Documents List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {viewingProject && getDocuments(viewingProject).map((doc, index) => (
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
            {viewingProject && getDocuments(viewingProject).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay documentos
              </p>
            )}
          </div>

          {/* Upload Form */}
          <div className="border-t pt-4 mt-4 space-y-3">
            <Label className="font-semibold">Agregar nuevo documento</Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Nombre del documento"
            />
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <Button 
              onClick={handleUploadDoc} 
              className="w-full" 
              disabled={!projectFile || uploading}
            >
              {uploading ? "Subiendo..." : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
