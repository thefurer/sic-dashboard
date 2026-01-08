import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

export default function OfficialProjects() {
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
                        <span className="text-muted-foreground text-sm">Sin documento</span>
                      )}
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
    </div>
  );
}
