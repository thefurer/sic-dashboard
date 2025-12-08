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
  Download, 
  Loader2, 
  Target,
  FileBadge,
  BookOpen,
  Briefcase,
  CalendarRange,
  Eye,
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
        <h1 className="text-3xl font-bold gradient-text">
          Información General del Grupo GISICF
        </h1>
        <p className="text-muted-foreground mt-2">
          Misión, Visión, Objetivos, Documentación y Líneas de Investigación
        </p>
      </div>

      {/* Row 1: Strategic Text - Mission, Vision, Objectives */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Misión Card */}
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Building2 className="h-5 w-5 text-primary relative" />
              </div>
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
                  <Button variant="outline" size="sm" className="w-full border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Misión
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-slate-200 dark:border-white/10">
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
                        className="mt-2 bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
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
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
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
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Eye className="h-5 w-5 text-primary relative" />
              </div>
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
                  <Button variant="outline" size="sm" className="w-full border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Visión
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-slate-200 dark:border-white/10">
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
                        className="mt-2 bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
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
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
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
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Target className="h-5 w-5 text-primary relative" />
              </div>
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
                  <Button variant="outline" size="sm" className="w-full border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Objetivos
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-slate-200 dark:border-white/10">
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
                        className="mt-2 bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
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
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
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

      {/* Row 2: Documents */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Registry PDF */}
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <FileBadge className="h-5 w-5 text-amber-500 relative" />
              </div>
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.registry_pdf_url ? (
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">
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
              <p className="text-xs text-center text-muted-foreground py-2">
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
                  className="text-xs bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
                />
                {uploading === "registry_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions PDF */}
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <BookOpen className="h-5 w-5 text-blue-500 relative" />
              </div>
              Instructivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.instructions_pdf_url ? (
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">
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
              <p className="text-xs text-center text-muted-foreground py-2">
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
                  className="text-xs bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
                />
                {uploading === "instructions_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Plan PDF */}
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Briefcase className="h-5 w-5 text-purple-500 relative" />
              </div>
              Plan de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.work_plan_pdf_url ? (
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">
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
              <p className="text-xs text-center text-muted-foreground py-2">
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
                  className="text-xs bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
                />
                {uploading === "work_plan_pdf_url" && (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational Planning */}
        <Card className="glass-card group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <CalendarRange className="h-5 w-5 text-teal-500 relative" />
              </div>
              Planificación Semestral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.planning_pdf_url ? (
              <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">
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
              <p className="text-xs text-center text-muted-foreground py-2">
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
                  className="text-xs bg-slate-50 dark:bg-background/50 border-slate-200 dark:border-white/10"
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
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTree className="h-5 w-5 text-primary" />
              Líneas de Investigación
            </div>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setResearchLinesOpen(true)}
                className="border-white/20 hover:bg-white/10"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {researchLines.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {researchLines.map((line, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-white/10">
                  <AccordionTrigger className="text-sm hover:text-primary">
                    {line}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    Línea de investigación activa del grupo GISICF.
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay líneas de investigación definidas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Research Lines Manager Dialog */}
      <ResearchLinesManager
        open={researchLinesOpen}
        onOpenChange={setResearchLinesOpen}
        currentLines={researchLines}
        settingsId={settings?.id || ""}
      />
    </div>
  );
}
