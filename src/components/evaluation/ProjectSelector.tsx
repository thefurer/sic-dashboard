import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

interface ProjectSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function ProjectSelector({ value, onChange, required }: ProjectSelectorProps) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["official-projects"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("official_projects")
        .select("*")
        .gte("year", currentYear - 1)
        .order("year", { ascending: false })
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando proyectos...</div>;
  }

  const selectedProject = projects?.find(p => p.id === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>
          Proyecto Vinculado {required && <span className="text-destructive">*</span>}
        </Label>
        {selectedProject?.project_document_url && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-primary"
            onClick={() => window.open(selectedProject.project_document_url!, '_blank')}
          >
            <FileText className="h-4 w-4 mr-1" />
            Ver Documento
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccione el proyecto I+D+i vinculado" />
        </SelectTrigger>
        <SelectContent>
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              No hay proyectos disponibles para este año
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}