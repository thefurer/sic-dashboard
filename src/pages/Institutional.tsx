import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  ListTree,
  Users,
  Shield,
  Cpu,
  ChevronDown
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { ResearchLinesManager } from "@/components/institutional/ResearchLinesManager";
import { ExpandableCard } from "@/components/institutional/ExpandableCard";
import { DocumentCard } from "@/components/institutional/DocumentCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { generateUserManualPDF } from "@/lib/userManualPdfGenerator";
import { generateAdminManualPDF } from "@/lib/adminManualPdfGenerator";
import { generateTechnicalSheetPDF } from "@/lib/technicalSheetPdfGenerator";
import { motion } from "framer-motion";

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
  const [showResearchLines, setShowResearchLines] = useState(false);

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

  const EditDialog = ({ 
    open, 
    onOpenChange, 
    title, 
    value, 
    onChange, 
    field 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    title: string; 
    value: string; 
    onChange: (value: string) => void;
    field: string;
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle>Editar {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Texto</Label>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={6}
              className="mt-2 bg-muted/50 border-border"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate({ field, value })}
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold gradient-text">
          Información General del Grupo GISICF
        </h1>
        <p className="text-muted-foreground mt-2">
          Misión, Visión, Objetivos, Documentación y Líneas de Investigación
        </p>
      </motion.div>

      {/* Strategic Content - Mission, Vision, Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {/* Misión */}
        <ExpandableCard
          icon={<Building2 className="h-5 w-5 text-primary" />}
          title="Misión"
          content={settings?.mission_text || ""}
          iconColorClass="bg-primary/30"
          actions={
            isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setMissionOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )
          }
        />

        {/* Visión */}
        <ExpandableCard
          icon={<Eye className="h-5 w-5 text-blue-500" />}
          title="Visión"
          content={settings?.vision_text || ""}
          iconColorClass="bg-blue-500/30"
          actions={
            isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setVisionOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )
          }
        />

        {/* Objetivos */}
        <ExpandableCard
          icon={<Target className="h-5 w-5 text-amber-500" />}
          title="Objetivos"
          content={settings?.objectives_text || ""}
          iconColorClass="bg-amber-500/30"
          actions={
            isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setObjectivesOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )
          }
        />
      </motion.div>

      {/* Documents Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-5 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-muted/50">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Documentación</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Registro */}
          <DocumentCard
            icon={<FileBadge className="h-5 w-5 text-amber-500" />}
            title="Registro"
            downloadUrl={settings?.registry_pdf_url}
            isAdmin={isAdmin}
            uploading={uploading === "registry_pdf_url"}
            fieldName="registry_pdf_url"
            onUpload={(e) => handlePdfUpload(e, "registry_pdf_url", "Registro")}
            iconColorClass="bg-amber-500/30"
          />

          {/* Plan de Trabajo */}
          <DocumentCard
            icon={<Briefcase className="h-5 w-5 text-purple-500" />}
            title="Plan de Trabajo"
            downloadUrl={settings?.work_plan_pdf_url}
            isAdmin={isAdmin}
            uploading={uploading === "work_plan_pdf_url"}
            fieldName="work_plan_pdf_url"
            onUpload={(e) => handlePdfUpload(e, "work_plan_pdf_url", "Plan de Trabajo")}
            iconColorClass="bg-purple-500/30"
          />

          {/* Planificación Semestral */}
          <DocumentCard
            icon={<CalendarRange className="h-5 w-5 text-teal-500" />}
            title="Planificación Semestral"
            downloadUrl={settings?.planning_pdf_url}
            isAdmin={isAdmin}
            uploading={uploading === "planning_pdf_url"}
            fieldName="planning_pdf_url"
            onUpload={(e) => handlePdfUpload(e, "planning_pdf_url", "Planificación")}
            iconColorClass="bg-teal-500/30"
          />

          {/* Instructivo adicional (si existe) */}
          {(settings?.instructions_pdf_url || isAdmin) && (
            <DocumentCard
              icon={<BookOpen className="h-5 w-5 text-blue-500" />}
              title="Instructivo"
              downloadUrl={settings?.instructions_pdf_url}
              isAdmin={isAdmin}
              uploading={uploading === "instructions_pdf_url"}
              fieldName="instructions_pdf_url"
              onUpload={(e) => handlePdfUpload(e, "instructions_pdf_url", "Instructivo")}
              iconColorClass="bg-blue-500/30"
            />
          )}
        </div>

        {/* Manuales generados */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Manuales de la Plataforma</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              size="sm"
              variant="outline"
              className="justify-start border-blue-500/20 hover:bg-blue-500/10"
              onClick={async () => {
                toast.info("Generando Manual de Usuario...");
                try {
                  await generateUserManualPDF();
                  toast.success("Manual descargado");
                } catch { toast.error("Error al generar"); }
              }}
            >
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Manual Usuario
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="justify-start border-purple-500/20 hover:bg-purple-500/10"
              onClick={async () => {
                toast.info("Generando Manual de Administrador...");
                try {
                  await generateAdminManualPDF();
                  toast.success("Manual descargado");
                } catch { toast.error("Error al generar"); }
              }}
            >
              <Shield className="h-4 w-4 mr-2 text-purple-500" />
              Manual Admin
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="justify-start border-emerald-500/20 hover:bg-emerald-500/10"
              onClick={async () => {
                toast.info("Generando Ficha Técnica...");
                try {
                  await generateTechnicalSheetPDF();
                  toast.success("Ficha descargada");
                } catch { toast.error("Error al generar"); }
              }}
            >
              <Cpu className="h-4 w-4 mr-2 text-emerald-500" />
              Ficha Técnica
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Research Lines - Collapsible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Collapsible open={showResearchLines} onOpenChange={setShowResearchLines}>
          <div className="glass-card p-5 rounded-2xl">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted/50">
                    <ListTree className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Líneas de Investigación
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {researchLines.length} líneas activas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResearchLinesOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-primary">
                    <ChevronDown className={`h-4 w-4 transition-transform ${showResearchLines ? "rotate-180" : ""}`} />
                    {showResearchLines ? "Ocultar" : "Ver todas"}
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>

            {/* Preview of first 5 lines when collapsed */}
            {!showResearchLines && researchLines.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {researchLines.slice(0, 5).map((line, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {line}
                  </span>
                ))}
                {researchLines.length > 5 && (
                  <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                    +{researchLines.length - 5} más
                  </span>
                )}
              </div>
            )}

            <CollapsibleContent>
              <div className="mt-4 pt-4 border-t border-border/50">
                {researchLines.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {researchLines.map((line, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`} className="border-border/50">
                        <AccordionTrigger className="text-sm hover:text-primary py-3">
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
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </motion.div>

      {/* Edit Dialogs */}
      <EditDialog
        open={missionOpen}
        onOpenChange={setMissionOpen}
        title="Misión"
        value={missionText}
        onChange={setMissionText}
        field="mission_text"
      />
      <EditDialog
        open={visionOpen}
        onOpenChange={setVisionOpen}
        title="Visión"
        value={visionText}
        onChange={setVisionText}
        field="vision_text"
      />
      <EditDialog
        open={objectivesOpen}
        onOpenChange={setObjectivesOpen}
        title="Objetivos"
        value={objectivesText}
        onChange={setObjectivesText}
        field="objectives_text"
      />

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
