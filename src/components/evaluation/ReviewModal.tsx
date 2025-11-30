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
import { CalendarIcon, CheckCircle2, AlertCircle, ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Fetch evaluation items with evidence
  const { data: evaluationItems } = useQuery({
    queryKey: ["evaluation-items", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_items")
        .select("*")
        .eq("report_id", report.id)
        .order("category", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

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
      <DialogContent className="max-w-2xl">
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

          {/* Evidence Details Section */}
          {evaluationItems && evaluationItems.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Evidencias Cargadas
              </h3>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {evaluationItems.map((item) => {
                    const evidenceDetails = item.evidence_details as Array<{url: string, description: string}> || [];
                    return (
                      <div key={item.id} className="border-l-2 border-primary pl-4 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-medium text-sm">{item.indicator_name}</p>
                            <p className="text-xs text-muted-foreground">Categoría {item.category}</p>
                          </div>
                          <span className="text-xs font-semibold text-primary">
                            {item.score_obtained || 0} pts
                          </span>
                        </div>
                        {item.justification && (
                          <p className="text-sm text-muted-foreground mb-2 italic">
                            {item.justification}
                          </p>
                        )}
                        {evidenceDetails.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {evidenceDetails.map((evidence, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => window.open(evidence.url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Ver Evidencia {idx + 1}
                                </Button>
                                {evidence.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {evidence.description}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
