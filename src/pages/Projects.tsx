import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Wand2, Loader2, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjectMetadata } from "@/hooks/useProjectMetadata";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import { MultiSelect, type Option } from "@/components/ui/multi-select";

type Project = Tables<"projects"> & {
  profiles?: { full_name: string } | null;
  project_investigators?: Array<{
    investigator_id: string;
    profiles: { full_name: string } | null;
  }>;
};

const ITEMS_PER_PAGE = 5;

const projectTypeMap: Record<string, string> = {
  "Basic Research": "Investigación Básica",
  "Applied Research": "Investigación Aplicada",
  "Tech Development": "Desarrollo Tecnológico",
  "Innovation": "Innovación",
};

const statusMap: Record<string, "proposed" | "in-progress" | "finished"> = {
  "Proposed": "proposed",
  "In Progress": "in-progress",
  "Finished": "finished",
};

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [importInput, setImportInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvestigators, setSelectedInvestigators] = useState<string[]>([]);
  
  const { fetchMetadata, isLoading: isImporting } = useProjectMetadata();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all profiles for investigator selection
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const investigatorOptions: Option[] = profiles.map((profile) => ({
    label: profile.full_name,
    value: profile.id,
  }));

  // Fetch projects from Supabase with investigators
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          profiles:investigator_id (
            full_name
          ),
          project_investigators (
            investigator_id,
            profiles:investigator_id (
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: {
      title: string;
      description: string | null;
      investigator_id: string;
      start_date: string;
      type: "Basic Research" | "Applied Research" | "Tech Development" | "Innovation";
      status: "Proposed" | "In Progress" | "Finished";
      investigators: string[];
    }) => {
      const { investigators, ...projectData } = newProject;
      
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Add investigators
      if (investigators.length > 0) {
        const investigatorRecords = investigators.map(investigatorId => ({
          project_id: project.id,
          investigator_id: investigatorId,
        }));
        
        const { error: investigatorsError } = await supabase
          .from("project_investigators")
          .insert(investigatorRecords);
        
        if (investigatorsError) throw investigatorsError;
      }
      
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente",
      });
      handleCloseCreateDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el proyecto",
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (updatedProject: {
      id: string;
      title: string;
      description: string | null;
      start_date: string;
      type: "Basic Research" | "Applied Research" | "Tech Development" | "Innovation";
      status: "Proposed" | "In Progress" | "Finished";
      investigators: string[];
    }) => {
      const { id, investigators, ...updates } = updatedProject;
      
      // Update the project
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Delete existing investigators and add new ones
      await supabase
        .from("project_investigators")
        .delete()
        .eq("project_id", id);
      
      if (investigators.length > 0) {
        const investigatorRecords = investigators.map(investigatorId => ({
          project_id: id,
          investigator_id: investigatorId,
        }));
        
        const { error: investigatorsError } = await supabase
          .from("project_investigators")
          .insert(investigatorRecords);
        
        if (investigatorsError) throw investigatorsError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto se ha actualizado exitosamente",
      });
      setIsEditDialogOpen(false);
      setEditingProject(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el proyecto",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado exitosamente",
      });
      setIsDeleteDialogOpen(false);
      setDeletingProjectId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.profiles?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || statusMap[project.status] === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleSmartImport = async () => {
    if (!importInput.trim()) {
      toast({
        title: "Campo vacío",
        description: "Por favor ingrese un DOI o URL",
        variant: "destructive",
      });
      return;
    }

    const metadata = await fetchMetadata(importInput);
    
    if (metadata) {
      setProjectTitle(metadata.title);
      setStartDate(metadata.startDate);
      setProjectType(metadata.type);
      setIsAutoFilled(true);
      
      setTimeout(() => setIsAutoFilled(false), 1000);
      
      toast({
        title: "Datos importados",
        description: "Los campos se han completado automáticamente",
      });
    }
  };

  const handleCreateProject = () => {
    if (!projectTitle || !projectType || !startDate || !projectStatus) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "No autenticado",
        description: "Debes iniciar sesión para crear proyectos",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate({
      title: projectTitle,
      description: projectDescription || null,
      investigator_id: user.id,
      start_date: startDate,
      type: projectType as "Basic Research" | "Applied Research" | "Tech Development" | "Innovation",
      status: projectStatus as "Proposed" | "In Progress" | "Finished",
      investigators: selectedInvestigators,
    });
  };

  const handleEditProject = () => {
    if (!editingProject) return;

    if (!projectTitle || !projectType || !startDate || !projectStatus) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    updateProjectMutation.mutate({
      id: editingProject.id,
      title: projectTitle,
      description: projectDescription || null,
      start_date: startDate,
      type: projectType as "Basic Research" | "Applied Research" | "Tech Development" | "Innovation",
      status: projectStatus as "Proposed" | "In Progress" | "Finished",
      investigators: selectedInvestigators,
    });
  };

  const handleDeleteProject = () => {
    if (deletingProjectId) {
      deleteProjectMutation.mutate(deletingProjectId);
    }
  };

  const handleCloseCreateDialog = () => {
    setProjectTitle("");
    setProjectDescription("");
    setProjectType("");
    setStartDate("");
    setProjectStatus("");
    setImportInput("");
    setIsAutoFilled(false);
    setSelectedInvestigators([]);
    setIsCreateDialogOpen(false);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setProjectTitle(project.title);
    setProjectDescription(project.description || "");
    setProjectType(project.type);
    setStartDate(project.start_date);
    setProjectStatus(project.status);
    
    // Set selected investigators from project_investigators
    const investigatorIds = project.project_investigators?.map(pi => pi.investigator_id) || [];
    setSelectedInvestigators(investigatorIds);
    
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (projectId: string) => {
    setDeletingProjectId(projectId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Proyectos de Investigación</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestión y seguimiento de proyectos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
              <DialogDescription>
                Complete la información del proyecto de investigación
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Smart Import Section */}
              <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Importar desde Fuente Externa
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ingrese un DOI o URL para autocompletar los campos del proyecto
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingrese DOI (ej: 10.1109/...) o URL del proyecto..."
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    disabled={isImporting}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSmartImport}
                    disabled={isImporting || !importInput.trim()}
                    className="gap-2"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Autocompletar
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  O ingrese manualmente
                </span>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título del Proyecto *</Label>
                  <Input
                    id="title"
                    placeholder="Ingrese el título"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    placeholder="Descripción del proyecto (opcional)"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="investigator">Investigador Principal *</Label>
                  <Input
                    id="investigator"
                    placeholder="Nombre del investigador"
                    value={user?.user_metadata?.full_name || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Se asignará automáticamente tu usuario como investigador principal
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="additional-investigators">Investigadores Adicionales</Label>
                  <MultiSelect
                    options={investigatorOptions}
                    selected={selectedInvestigators}
                    onChange={setSelectedInvestigators}
                    placeholder="Seleccionar investigadores adicionales"
                  />
                  <p className="text-xs text-muted-foreground">
                    Puede agregar más investigadores al proyecto
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Investigación *</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="type" className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic Research">Investigación Básica</SelectItem>
                      <SelectItem value="Applied Research">Investigación Aplicada</SelectItem>
                      <SelectItem value="Tech Development">Desarrollo Tecnológico</SelectItem>
                      <SelectItem value="Innovation">Innovación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select value={projectStatus} onValueChange={setProjectStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Proposed">Propuesto</SelectItem>
                        <SelectItem value="In Progress">En Progreso</SelectItem>
                        <SelectItem value="Finished">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseCreateDialog}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Proyecto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="proposed">Propuestos</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="finished">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {isLoadingProjects ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron proyectos</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-500 dark:text-slate-400">Título</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Investigador Principal</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Tipo</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Fecha Inicio</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400">Estado</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-slate-900 dark:text-slate-50">{project.title}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{project.profiles?.full_name || "Desconocido"}</span>
                          {project.project_investigators && project.project_investigators.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +{project.project_investigators.length} investigador{project.project_investigators.length > 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {projectTypeMap[project.type] || project.type}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">
                        {new Date(project.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={statusMap[project.status]} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(project)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(project.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProjects.length)} de {filteredProjects.length} proyectos
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
            <DialogDescription>
              Modifique la información del proyecto
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título del Proyecto *</Label>
              <Input
                id="edit-title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Input
                id="edit-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-investigator">Investigador Principal *</Label>
              <Input
                id="edit-investigator"
                placeholder="Nombre del investigador"
                value={editingProject?.profiles?.full_name || ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                El investigador principal no puede ser modificado
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-additional-investigators">Investigadores Adicionales</Label>
              <MultiSelect
                options={investigatorOptions}
                selected={selectedInvestigators}
                onChange={setSelectedInvestigators}
                placeholder="Seleccionar investigadores adicionales"
              />
              <p className="text-xs text-muted-foreground">
                Puede agregar o quitar investigadores del proyecto
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo de Investigación *</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic Research">Investigación Básica</SelectItem>
                  <SelectItem value="Applied Research">Investigación Aplicada</SelectItem>
                  <SelectItem value="Tech Development">Desarrollo Tecnológico</SelectItem>
                  <SelectItem value="Innovation">Innovación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Fecha de Inicio *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Estado *</Label>
                <Select value={projectStatus} onValueChange={setProjectStatus}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proposed">Propuesto</SelectItem>
                    <SelectItem value="In Progress">En Progreso</SelectItem>
                    <SelectItem value="Finished">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditProject}
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proyecto será eliminado permanentemente de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
