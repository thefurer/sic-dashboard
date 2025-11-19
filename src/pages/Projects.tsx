import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Wand2, Loader2 } from "lucide-react";
import { useProjectMetadata } from "@/hooks/useProjectMetadata";
import { useToast } from "@/hooks/use-toast";

const mockProjects = [
  {
    id: 1,
    title: "Desarrollo de Sistema de Monitoreo Ambiental con IA",
    investigator: "Dr. Juan Pérez",
    startDate: "2024-01-15",
    status: "in-progress" as const,
    type: "Applied Research",
  },
  {
    id: 2,
    title: "Plataforma IoT para Agricultura de Precisión",
    investigator: "Dra. María González",
    startDate: "2023-09-01",
    status: "in-progress" as const,
    type: "Technological Development",
  },
  {
    id: 3,
    title: "Análisis de Redes Neuronales para Diagnóstico Médico",
    investigator: "Dr. Carlos Ramírez",
    startDate: "2023-06-10",
    status: "finished" as const,
    type: "Basic Research",
  },
  {
    id: 4,
    title: "Sistema de Gestión Inteligente de Energía",
    investigator: "Ing. Ana Torres",
    startDate: "2024-03-01",
    status: "proposed" as const,
    type: "Innovation",
  },
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [importInput, setImportInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [investigator, setInvestigator] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
  const { fetchMetadata, isLoading } = useProjectMetadata();
  const { toast } = useToast();

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.investigator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      // Auto-fill the form fields with animation trigger
      setProjectTitle(metadata.title);
      setInvestigator(metadata.investigator);
      setStartDate(metadata.startDate);
      setProjectType(metadata.type);
      setIsAutoFilled(true);
      
      // Reset animation state after a brief delay
      setTimeout(() => setIsAutoFilled(false), 1000);
      
      toast({
        title: "Datos importados",
        description: "Los campos se han completado automáticamente",
      });
    }
  };

  const handleCreateProject = () => {
    // Validate required fields
    if (!projectTitle || !investigator || !projectType || !startDate || !projectStatus) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally save to Supabase
    toast({
      title: "Proyecto creado",
      description: "El proyecto se ha creado exitosamente",
    });
    
    // Reset form
    setProjectTitle("");
    setInvestigator("");
    setProjectType("");
    setStartDate("");
    setProjectStatus("");
    setImportInput("");
    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    // Reset all form fields when dialog closes
    setProjectTitle("");
    setInvestigator("");
    setProjectType("");
    setStartDate("");
    setProjectStatus("");
    setImportInput("");
    setIsAutoFilled(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyectos de Investigación</h1>
          <p className="text-muted-foreground">Gestión y seguimiento de proyectos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSmartImport}
                    disabled={isLoading || !importInput.trim()}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    Autocompletar
                  </Button>
                </div>
              </div>

              {/* Separator */}
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  O ingrese manualmente
                </span>
              </div>

              {/* Manual Form Fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título del Proyecto</Label>
                  <Input
                    id="title"
                    placeholder="Ingrese el título"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="investigator">Investigador Principal</Label>
                  <Input
                    id="investigator"
                    placeholder="Nombre del investigador"
                    value={investigator}
                    onChange={(e) => setInvestigator(e.target.value)}
                    className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Investigación</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="type" className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Investigación Básica</SelectItem>
                      <SelectItem value="applied">Investigación Aplicada</SelectItem>
                      <SelectItem value="development">Desarrollo Tecnológico</SelectItem>
                      <SelectItem value="innovation">Innovación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={isAutoFilled ? "animate-fade-in ring-2 ring-primary/50" : ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={projectStatus} onValueChange={setProjectStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proposed">Propuesto</SelectItem>
                        <SelectItem value="in-progress">En Progreso</SelectItem>
                        <SelectItem value="finished">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProject}>
                Crear Proyecto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Investigador Principal</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.investigator}</TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
