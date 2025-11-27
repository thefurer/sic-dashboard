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
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function OfficialProjectsList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [projectYear, setProjectYear] = useState(new Date().getFullYear());
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
    mutationFn: async (data: { id?: string; name: string; year: number }) => {
      if (data.id) {
        const { error } = await supabase
          .from("official_projects")
          .update({ name: data.name, year: data.year, updated_at: new Date().toISOString() })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("official_projects")
          .insert({ name: data.name, year: data.year });
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

  const resetForm = () => {
    setProjectName("");
    setProjectYear(new Date().getFullYear());
    setEditingProject(null);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectYear(project.year);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!projectName.trim()) {
      toast.error("El nombre del proyecto es requerido");
      return;
    }

    saveMutation.mutate({
      id: editingProject?.id,
      name: projectName,
      year: projectYear,
    });
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
              <Button onClick={handleSave} className="w-full">
                {saveMutation.isPending ? "Guardando..." : "Guardar"}
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.year}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay proyectos registrados. Crea uno para comenzar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}