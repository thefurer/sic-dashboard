import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Building2, 
  Pencil, 
  Upload, 
  Download, 
  Loader2, 
  Target,
  FileBadge,
  BookOpen,
  Briefcase,
  CalendarRange,
  ListTree
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { ResearchLinesManager } from "@/components/institutional/ResearchLinesManager";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Institutional() {
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";

  const [missionText, setMissionText] = useState("");
  const [visionText, setVisionText] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [missionOpen, setMissionOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [researchLinesOpen, setResearchLinesOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["institutional-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .single();
      if (error) throw error;
      setMissionText(data.mission_text || "");
      setVisionText(data.vision_text || "");
      setObjectivesText(data.objectives_text || "");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: string }) => {
      const { error } = await supabase
        .from("app_settings")
        .update({ [field]: value })
        .eq("id", settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional-settings"] });
      toast.success("Actualizado correctamente");
      setMissionOpen(false);
      setVisionOpen(false);
      setObjectivesOpen(false);
    },
    onError: () => {
      toast.error("Error al actualizar");
    },
  });

  const handlePdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    displayName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    setUploading(fieldName);
    try {
      const fileName = `${fieldName}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("institutional-docs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("institutional-docs")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("app_settings")
        .update({ [fieldName]: urlData.publicUrl })
        .eq("id", settings?.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["institutional-settings"] });
      toast.success(`${displayName} actualizado correctamente`);
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el PDF");
    } finally {
      setUploading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const researchLines = (settings?.research_lines as string[]) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Información General del Grupo GISICF
        </h1>
        <p className="text-muted-foreground mt-2">
          Misión, Visión, Objetivos, Documentación y Líneas de Investigación
        </p>
      </div>

      {/* Row 1: Strategic Text - Mission, Vision, Objectives */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Misión Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Misión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {settings?.mission_text || "No definida"}
            </p>

            {isAdmin && (
              <Dialog open={missionOpen} onOpenChange={setMissionOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Misión
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Misión</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mission">Texto de la Misión</Label>
                      <Textarea
                        id="mission"
                        value={missionText}
                        onChange={(e) => setMissionText(e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        updateMutation.mutate({
                          field: "mission_text",
                          value: missionText,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="w-full"
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Visión Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Visión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {settings?.vision_text || "No definida"}
            </p>

            {isAdmin && (
              <Dialog open={visionOpen} onOpenChange={setVisionOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Visión
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Visión</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vision">Texto de la Visión</Label>
                      <Textarea
                        id="vision"
                        value={visionText}
                        onChange={(e) => setVisionText(e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        updateMutation.mutate({
                          field: "vision_text",
                          value: visionText,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="w-full"
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>

        {/* Objetivos Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {settings?.objectives_text || "No definidos"}
            </p>

            {isAdmin && (
              <Dialog open={objectivesOpen} onOpenChange={setObjectivesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Objetivos
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Objetivos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="objectives">Texto de los Objetivos</Label>
                      <Textarea
                        id="objectives"
                        value={objectivesText}
                        onChange={(e) => setObjectivesText(e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        updateMutation.mutate({
                          field: "objectives_text",
                          value: objectivesText,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="w-full"
                    >
                      {updateMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Documents - Registry, Instructions, Work Plan, Planning */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Registry PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileBadge className="h-5 w-5 text-primary" />
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.registry_pdf_url ? (
              <Button asChild variant="default" size="sm" className="w-full">
                <a
                  href={settings.registry_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                No disponible
              </p>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handlePdfUpload(e, "registry_pdf_url", "Registro")
                  }
                  disabled={uploading === "registry_pdf_url"}
                  className="text-xs"
                />
                {uploading === "registry_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              Instructivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.instructions_pdf_url ? (
              <Button asChild variant="default" size="sm" className="w-full">
                <a
                  href={settings.instructions_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                No disponible
              </p>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handlePdfUpload(e, "instructions_pdf_url", "Instructivo")
                  }
                  disabled={uploading === "instructions_pdf_url"}
                  className="text-xs"
                />
                {uploading === "instructions_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Plan PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-5 w-5 text-primary" />
              Plan de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.work_plan_pdf_url ? (
              <Button asChild variant="default" size="sm" className="w-full">
                <a
                  href={settings.work_plan_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                No disponible
              </p>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handlePdfUpload(e, "work_plan_pdf_url", "Plan de Trabajo")
                  }
                  disabled={uploading === "work_plan_pdf_url"}
                  className="text-xs"
                />
                {uploading === "work_plan_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational Planning (Renamed) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-5 w-5 text-primary" />
              Planificación Semestral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.planning_pdf_url ? (
              <Button asChild variant="default" size="sm" className="w-full">
                <a
                  href={settings.planning_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </Button>
            ) : (
              <p className="text-xs text-center text-muted-foreground">
                No disponible
              </p>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handlePdfUpload(e, "planning_pdf_url", "Planificación")
                  }
                  disabled={uploading === "planning_pdf_url"}
                  className="text-xs"
                />
                {uploading === "planning_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Research Lines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListTree className="h-5 w-5 text-primary" />
            Líneas de Investigación
          </CardTitle>
          {isAdmin && (
            <Button
              onClick={() => setResearchLinesOpen(true)}
              variant="outline"
              size="sm"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar Líneas
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {researchLines.map((line, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-sm">
                  {line}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Línea de investigación activa del grupo GISICF.
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {researchLines.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-8">
              No hay líneas de investigación definidas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Research Lines Manager Modal */}
      {settings && (
        <ResearchLinesManager
          open={researchLinesOpen}
          onOpenChange={setResearchLinesOpen}
          currentLines={researchLines}
          settingsId={settings.id}
        />
      )}
    </div>
  );
}
