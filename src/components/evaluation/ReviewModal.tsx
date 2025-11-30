import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, AlertCircle, ExternalLink, FileText, Users, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: {
    id: string;
    year: number;
    total_score: number;
    user_id: string;
    status: string;
  };
  userName: string;
}

export function ReviewModal({ open, onOpenChange, report, userName }: ReviewModalProps) {
  const [observations, setObservations] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const queryClient = useQueryClient();

  // Fetch evaluation items with full metadata
  const { data: evaluationItems } = useQuery({
    queryKey: ["evaluation-items", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_items")
        .select(`
          *,
          related_project:official_projects(name)
        `)
        .eq("report_id", report.id)
        .order("category", { ascending: true });

      if (error) throw error;
      
      // Deduplicate Section D items by indicator_name
      const items = data || [];
      const uniqueItems = new Map();
      
      items.forEach(item => {
        if (item.category === 'D') {
          const key = item.indicator_name;
          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, item);
          }
        } else {
          uniqueItems.set(item.id, item);
        }
      });
      
      return Array.from(uniqueItems.values());
    },
    enabled: open,
  });

  // Fetch team member profiles for displaying names
  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-evaluation", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const getProfileName = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.full_name || "Usuario desconocido";
  };

  const handleOpenEvidence = (filePath: string) => {
    if (!filePath) {
      toast.error("Ruta de archivo no encontrada");
      return;
    }
    const { data } = supabase.storage
      .from('evaluation-evidence')
      .getPublicUrl(filePath);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    } else {
      toast.error("No se pudo generar la URL del archivo");
    }
  };

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("evaluation_reports")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_observations: null,
          correction_deadline: null,
        })
        .eq("id", report.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evaluación aprobada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error al aprobar", { description: error.message });
    },
  });

  const observeMutation = useMutation({
    mutationFn: async () => {
      if (!observations.trim()) {
        throw new Error("Las observaciones son obligatorias");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("evaluation_reports")
        .update({
          status: "needs_correction",
          admin_observations: observations,
          correction_deadline: deadline?.toISOString().split('T')[0] || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", report.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Observaciones enviadas exitosamente");
      queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      onOpenChange(false);
      setObservations("");
      setDeadline(undefined);
    },
    onError: (error) => {
      toast.error("Error al enviar observaciones", { description: error.message });
    },
  });

  const handleApprove = () => {
    if (window.confirm(`¿Estás seguro de aprobar la evaluación de ${userName}?`)) {
      approveMutation.mutate();
    }
  };

  const handleObserve = () => {
    observeMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Evaluación - {userName}</DialogTitle>
          <DialogDescription>
            Año {report.year} • Puntuación: {report.total_score}/100 pts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold mb-2">Resumen de Puntuación</h3>
            <p className="text-sm text-muted-foreground">
              El investigador ha obtenido <span className="font-bold text-foreground">{report.total_score} puntos</span> de 100 posibles.
            </p>
            {report.total_score === 100 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Evaluación completa
              </p>
            )}
            {report.total_score < 100 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Evaluación incompleta
              </p>
            )}
          </div>

          {/* Detailed Evidence Review - Grouped by Category */}
          {evaluationItems && evaluationItems.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalle Completo de Evaluación ({evaluationItems.length} items)
              </h3>
              <ScrollArea className="h-[500px] pr-4">
                <Accordion type="multiple" className="space-y-4">
                  {/* Section A: Publicación */}
                  {evaluationItems.filter(i => i.category === 'A').length > 0 && (
                    <AccordionItem value="section-a" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">Sección A: Publicación</span>
                          <span className="text-xs text-muted-foreground">
                            ({evaluationItems.filter(i => i.category === 'A').length} items)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'A').map((item) => {
                            const evidenceDetails = item.evidence_details as Array<{url: string, description: string}> || [];
                            const articleMeta = item.article_metadata as any;
                            const projectRoles = item.project_roles as any;
                            const teamMembers = item.team_members as string[] || [];
                            const relatedProject = item.related_project as any;

                            return (
                              <Card key={item.id} className="p-4 border-l-4 border-blue-500">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                  <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
                                    {item.score_obtained || 0} pts
                                  </span>
                                </div>

                                {/* Article Metadata */}
                                {articleMeta && (
                                  <div className="mb-3 p-3 bg-muted/50 rounded text-xs space-y-1">
                                    {articleMeta.title && <p><strong>Título:</strong> {articleMeta.title}</p>}
                                    {articleMeta.authors && <p><strong>Autores:</strong> {articleMeta.authors}</p>}
                                    {articleMeta.journal && <p><strong>Revista:</strong> {articleMeta.journal}</p>}
                                    {articleMeta.issn && <p><strong>ISSN:</strong> {articleMeta.issn}</p>}
                                    {articleMeta.doi && <p><strong>DOI:</strong> {articleMeta.doi}</p>}
                                    {articleMeta.quartile && <p><strong>Cuartil:</strong> {articleMeta.quartile}</p>}
                                    {articleMeta.indexed_in && <p><strong>Indizado en:</strong> {articleMeta.indexed_in}</p>}
                                  </div>
                                )}

                                {/* Project Info */}
                                {relatedProject && (
                                  <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
                                    <p><strong>Proyecto Vinculado:</strong> {relatedProject.name}</p>
                                    {item.proposal_type && <p><strong>Tipo:</strong> {item.proposal_type}</p>}
                                  </div>
                                )}

                                {/* Team Members */}
                                {(projectRoles || teamMembers.length > 0) && (
                                  <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Users className="w-3 h-3" />
                                      <strong>Equipo de Investigación:</strong>
                                    </div>
                                    {projectRoles?.director && (
                                      <p>• Director: {getProfileName(projectRoles.director)}</p>
                                    )}
                                    {projectRoles?.principal && (
                                      <p>• Investigador Principal: {getProfileName(projectRoles.principal)}</p>
                                    )}
                                    {teamMembers.length > 0 && (
                                      <p>• Equipo: {teamMembers.map(id => getProfileName(id)).join(', ')}</p>
                                    )}
                                  </div>
                                )}

                                {/* Justification */}
                                {item.justification && (
                                  <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs">
                                    <strong>Justificación:</strong>
                                    <p className="mt-1 italic">{item.justification}</p>
                                  </div>
                                )}

                                {/* Evidence Files */}
                                {evidenceDetails.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold">Evidencias Cargadas:</p>
                                    {evidenceDetails.map((evidence, idx) => (
                                      <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs shrink-0"
                                          onClick={() => handleOpenEvidence(evidence.url)}
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          Archivo {idx + 1}
                                        </Button>
                                        {evidence.description && (
                                          <p className="text-xs text-muted-foreground italic flex-1">
                                            {evidence.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Section B: Transferencia */}
                  {evaluationItems.filter(i => i.category === 'B').length > 0 && (
                    <AccordionItem value="section-b" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">Sección B: Transferencia</span>
                          <span className="text-xs text-muted-foreground">
                            ({evaluationItems.filter(i => i.category === 'B').length} items)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'B').map((item) => {
                            const evidenceDetails = item.evidence_details as Array<{url: string, description: string}> || [];
                            const relatedProject = item.related_project as any;

                            return (
                              <Card key={item.id} className="p-4 border-l-4 border-green-500">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                  <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                                    {item.score_obtained || 0} pts
                                  </span>
                                </div>

                                {relatedProject && (
                                  <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
                                    <p><strong>Proyecto Vinculado:</strong> {relatedProject.name}</p>
                                  </div>
                                )}

                                {item.justification && (
                                  <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs">
                                    <strong>Descripción:</strong>
                                    <p className="mt-1 italic">{item.justification}</p>
                                  </div>
                                )}

                                {evidenceDetails.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold">Evidencias Cargadas:</p>
                                    {evidenceDetails.map((evidence, idx) => (
                                      <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs shrink-0"
                                          onClick={() => handleOpenEvidence(evidence.url)}
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          Archivo {idx + 1}
                                        </Button>
                                        {evidence.description && (
                                          <p className="text-xs text-muted-foreground italic flex-1">
                                            {evidence.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Section C: Recursos */}
                  {evaluationItems.filter(i => i.category === 'C').length > 0 && (
                    <AccordionItem value="section-c" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-600">Sección C: Recursos</span>
                          <span className="text-xs text-muted-foreground">
                            ({evaluationItems.filter(i => i.category === 'C').length} items)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'C').map((item) => {
                            const evidenceDetails = item.evidence_details as Array<{url: string, description: string}> || [];

                            return (
                              <Card key={item.id} className="p-4 border-l-4 border-purple-500">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                  <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded">
                                    {item.score_obtained || 0} pts
                                  </span>
                                </div>

                                {item.monto && (
                                  <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                                    <p><strong>Monto Asignado:</strong> ${item.monto.toFixed(2)} USD</p>
                                  </div>
                                )}

                                {item.justification && (
                                  <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs">
                                    <strong>Descripción:</strong>
                                    <p className="mt-1 italic">{item.justification}</p>
                                  </div>
                                )}

                                {evidenceDetails.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold">Evidencias Cargadas:</p>
                                    {evidenceDetails.map((evidence, idx) => (
                                      <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs shrink-0"
                                          onClick={() => handleOpenEvidence(evidence.url)}
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          Archivo {idx + 1}
                                        </Button>
                                        {evidence.description && (
                                          <p className="text-xs text-muted-foreground italic flex-1">
                                            {evidence.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Section D: Impactos */}
                  {evaluationItems.filter(i => i.category === 'D').length > 0 && (
                    <AccordionItem value="section-d" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-orange-600">Sección D: Impactos</span>
                          <span className="text-xs text-muted-foreground">
                            ({evaluationItems.filter(i => i.category === 'D').length} items)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'D').map((item) => {
                            const evidenceDetails = item.evidence_details as Array<{url: string, description: string}> || [];

                            return (
                              <Card key={item.id} className="p-4 border-l-4 border-orange-500">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                  <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-2 py-1 rounded">
                                    {item.score_obtained || 0} pts
                                  </span>
                                </div>

                                {item.justification && (
                                  <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded text-xs">
                                    <strong>Justificación del Impacto:</strong>
                                    <p className="mt-1 italic whitespace-pre-wrap">{item.justification}</p>
                                  </div>
                                )}

                                {evidenceDetails.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold">Evidencias Cargadas:</p>
                                    {evidenceDetails.map((evidence, idx) => (
                                      <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs shrink-0"
                                          onClick={() => handleOpenEvidence(evidence.url)}
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          Archivo {idx + 1}
                                        </Button>
                                        {evidence.description && (
                                          <p className="text-xs text-muted-foreground italic flex-1">
                                            {evidence.description}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </ScrollArea>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="observations">Observaciones / Correcciones</Label>
            <Textarea
              id="observations"
              placeholder="Ej: Falta evidencia en el indicador X. Por favor adjuntar certificado de publicación..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Fecha Límite para Corrección (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending || observeMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={handleObserve}
            disabled={!observations.trim() || observeMutation.isPending}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {observeMutation.isPending ? "Enviando..." : "Enviar Observaciones"}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {approveMutation.isPending ? "Aprobando..." : "Aprobar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
