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
import { Building2, Pencil, FileText, Upload, Download, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function Institutional() {
  const queryClient = useQueryClient();
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";

  const [missionText, setMissionText] = useState("");
  const [visionText, setVisionText] = useState("");
  const [missionOpen, setMissionOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    },
    onError: () => {
      toast.error("Error al actualizar");
    },
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    setUploading(true);

    try {
      const fileName = `planificacion-operativa-${Date.now()}.pdf`;
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
        .update({ planning_pdf_url: urlData.publicUrl })
        .eq("id", settings?.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["institutional-settings"] });
      toast.success("PDF actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el PDF");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Información Institucional</h1>
        <p className="text-muted-foreground mt-2">
          Misión, Visión y Planificación Operativa de la Carrera
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Misión Card */}
        <Card className="relative">
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
        <Card className="relative">
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

        {/* Planificación Operativa Card */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Planificación Operativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <FileText className="h-20 w-20 text-muted-foreground" />
            </div>

            {settings?.planning_pdf_url ? (
              <Button
                asChild
                variant="default"
                className="w-full"
              >
                <a
                  href={settings.planning_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Planificación Vigente
                </a>
              </Button>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                No hay planificación disponible
              </p>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Actualizar PDF</Label>
                <div className="flex gap-2">
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo archivos PDF
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
