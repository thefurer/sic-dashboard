import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
        .eq("year", currentYear)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando proyectos...</div>;
  }

  return (
    <div className="space-y-2">
      <Label>
        Proyecto Vinculado {required && <span className="text-destructive">*</span>}
      </Label>
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