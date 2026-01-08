import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, ExternalLink, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OfficialProjects() {
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    mutationFn: async ({ projectId, file }: { projectId: string; file: File }) => {
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

      const { error: updateError } = await supabase
        .from("official_projects")
        .update({ project_document_url: publicUrl })
        .eq("id", projectId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-projects"] });
      toast.success("Documento subido correctamente");
      setIsDialogOpen(false);
      setSelectedFile(null);
      setUploadingProjectId(null);
    },
    onError: (error: any) => {
      toast.error("Error al subir el documento", { description: error.message });
    },
  });

  const handleUploadClick = (projectId: string) => {
    setUploadingProjectId(projectId);
    setIsDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadingProjectId) return;
    setUploading(true);
    await uploadMutation.mutateAsync({ projectId: uploadingProjectId, file: selectedFile });
    setUploading(false);
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
                  <TableHead className="text-right">Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.year}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {project.project_document_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(project.project_document_url, '_blank')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Documento
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm mr-2">Sin documento</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUploadClick(project.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {project.project_document_url ? "Cambiar" : "Subir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay proyectos registrados.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedFile(null);
          setUploadingProjectId(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Documento del Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="document">Documento (PDF)</Label>
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
                "Subir Documento"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
