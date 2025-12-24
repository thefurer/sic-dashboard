import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Send, AlertCircle, Download, Edit, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { generateEvaluationPDF } from "@/lib/evaluationPdfGenerator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import EditJustificationDialog from "./EditJustificationDialog";
import { openSignedUrl } from "@/hooks/useSignedUrl";

interface EvaluationItem {
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_url?: string;
  quantity?: number;
  justification?: string;
  monto?: number;
  fase?: string;
  porcentaje_ejecucion?: number;
}

interface ReviewStepProps {
  items: EvaluationItem[];
  totalScore: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  reportStatus?: string;
  reportId: string | null;
}

const CATEGORY_NAMES = {
  A: "Publicación y Difusión",
  B: "Transferencia",
  C: "Recursos Económicos",
  D: "Impactos",
};

const CATEGORY_MAX_SCORES = {
  A: 45,
  B: 10,
  C: 15,
  D: 30,
};

export default function ReviewStep({ items, totalScore, onSubmit, isSubmitting, reportStatus = "draft", reportId }: ReviewStepProps) {
  const [justificationDialogOpen, setJustificationDialogOpen] = useState(false);
  const [pendingEditAction, setPendingEditAction] = useState<(() => void) | null>(null);
  const queryClient = useQueryClient();

  const enableEditMutation = useMutation({
    mutationFn: async (justification: string) => {
      if (!reportId) throw new Error("No report ID");

      const { error } = await supabase
        .from("evaluation_reports")
        .update({
          status: "draft",
          edit_justification: justification,
          edited_after_submission: true,
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-report"] });
      toast.success("Modo de edición activado", {
        description: "Puede modificar su evaluación. Los cambios serán notificados al administrador.",
      });
      if (pendingEditAction) {
        pendingEditAction();
        setPendingEditAction(null);
      }
    },
    onError: (error) => {
      toast.error("Error al activar edición", {
        description: error.message,
      });
    },
  });

  const handleEnableEdit = () => {
    setJustificationDialogOpen(true);
  };

  const handleJustificationConfirm = (justification: string) => {
    enableEditMutation.mutate(justification);
    setJustificationDialogOpen(false);
  };
  const { data: report } = useQuery({
    queryKey: ["evaluation-report", new Date().getFullYear()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from("evaluation_reports")
        .select(`
          *,
          profiles!evaluation_reports_user_id_fkey (full_name)
        `)
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: observationAlert } = useQuery({
    queryKey: ["evaluation-observation-alert"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from("evaluation_reports")
        .select("admin_observations, correction_deadline")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .eq("status", "observado")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleDownloadPDF = async () => {
    if (!report) return;

    const userName = (report.profiles as any)?.full_name || "Usuario";
    
    await generateEvaluationPDF({
      year: report.year,
      total_score: totalScore,
      status: report.status,
      items: items,
      userName: userName,
    });
  };

  const getCategoryScore = (category: string) => {
    if (!items || items.length === 0) return 0;
    
    if (category === 'A') {
      const projects = items.filter(i => i.category === 'A' && i.indicator_name?.includes('Proyecto'));
      const articlesJCR = items.filter(i => i.category === 'A' && i.indicator_name?.includes('JCR'));
      const books = items.filter(i => i.category === 'A' && i.indicator_name?.includes('Libro'));
      const regional = items.filter(i => i.category === 'A' && i.indicator_name?.includes('Regional'));
      const papers = items.filter(i => i.category === 'A' && i.indicator_name?.includes('Ponencia'));
      
      return Math.min(
        (projects.length > 0 ? 15 : 0) +
        (articlesJCR.length > 0 ? 10 : 0) +
        (books.length > 0 ? 10 : 0) +
        (regional.length > 0 ? 5 : 0) +
        (papers.length > 0 ? 5 : 0),
        45
      );
    }
    
    if (category === 'B') {
      const vinculacion = items.filter(i => i.category === 'B');
      return Math.min(vinculacion.length > 0 ? 10 : 0, 10);
    }
    
    if (category === 'C') {
      const convocatorias = items.filter(i => i.category === 'C');
      return Math.min(convocatorias.length > 0 ? 15 : 0, 15);
    }
    
    if (category === 'D') {
      const impactSocial = items.filter(i => i.category === 'D' && i.indicator_name?.includes('Social'));
      const impactEnv = items.filter(i => i.category === 'D' && i.indicator_name?.includes('Ambiental'));
      const impactEcon = items.filter(i => i.category === 'D' && i.indicator_name?.includes('Económico'));
      
      return Math.min(
        (impactSocial.length > 0 ? 10 : 0) +
        (impactEnv.length > 0 ? 10 : 0) +
        (impactEcon.length > 0 ? 10 : 0),
        30
      );
    }
    
    return 0;
  };

  const getCategoryItems = (category: string) => {
    // Filter items by category and ensure uniqueness by id
    const categoryItems = items.filter((item) => item.category === category);
    
    // For category D, deduplicate by exact indicator_name (Social/Ambiental/Económico)
    if (category === 'D') {
      const uniqueByType = new Map();
      categoryItems.forEach(item => {
        const key = item.indicator_name;
        // Only keep first occurrence of each indicator type
        if (!uniqueByType.has(key)) {
          uniqueByType.set(key, {
            ...item,
            quantity: 1,
            score_obtained: 10 // Each impact type = 10 pts
          });
        }
      });
      return Array.from(uniqueByType.values());
    }
    
    // For other categories, deduplicate by indicator_name
    const uniqueByName = new Map();
    categoryItems.forEach(item => {
      if (!uniqueByName.has(item.indicator_name)) {
        uniqueByName.set(item.indicator_name, {
          ...item,
          quantity: 1
        });
      }
    });
    
    return Array.from(uniqueByName.values());
  };

  const canSubmit = totalScore === 100 && reportStatus === "draft";
  const isSubmitted = reportStatus === "submitted";
  const categories = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Revisión y Envío</h2>
        <p className="text-muted-foreground">
          Revise su evaluación antes de enviar el informe final
        </p>
      </div>

      {/* Submitted Status Alert */}
      {isSubmitted && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1">Evaluación Enviada</p>
                <p className="text-sm">Su evaluación ha sido enviada y está en revisión. Si necesita realizar cambios, puede activar el modo de edición.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableEdit}
                disabled={enableEditMutation.isPending}
                className="ml-4 border-green-600 text-green-700 hover:bg-green-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                {enableEditMutation.isPending ? "Activando..." : "Editar Envío"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Observations Alert */}
      {observationAlert && observationAlert.admin_observations && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Observaciones del Administrador:</p>
            <p className="mb-2">{observationAlert.admin_observations}</p>
            {observationAlert.correction_deadline && (
              <p className="text-sm">
                Fecha límite: {format(new Date(observationAlert.correction_deadline), "dd 'de' MMMM, yyyy", { locale: es })}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Alert */}
      {!canSubmit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debe completar 100 puntos para enviar la evaluación. Actualmente tiene {totalScore} puntos.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const score = getCategoryScore(category);
          const maxScore = CATEGORY_MAX_SCORES[category as keyof typeof CATEGORY_MAX_SCORES];
          const percentage = (score / maxScore) * 100;

          return (
            <Card key={category} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sección {category}: {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold text-foreground">{score}</span>
                    <span className="text-muted-foreground ml-1">/ {maxScore} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {score === maxScore && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <Badge
                      variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "outline"}
                      className={score === maxScore ? "bg-green-600" : ""}
                    >
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Score and PDF Download */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`md:col-span-2 border-2 ${canSubmit ? "bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500" : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary"}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Puntuación Total</p>
              <p className={`text-6xl font-bold mb-2 ${canSubmit ? "text-green-600" : "text-primary"}`}>
                {totalScore}
              </p>
              <p className="text-2xl text-muted-foreground">/ 100 puntos</p>
              <div className="mt-4">
                <Badge
                  variant={canSubmit ? "default" : "outline"}
                  className={`text-lg px-4 py-1 ${canSubmit ? "bg-green-600" : ""}`}
                >
                  {canSubmit ? "Completo" : `Faltan ${100 - totalScore} puntos`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={!report}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Informe (PDF)
              </Button>
              {report?.status === 'draft' && (
                <p className="text-xs text-muted-foreground text-center">
                  El PDF incluirá marca de agua "BORRADOR"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Items by Category */}
      {categories.map((category) => {
        const categoryItems = getCategoryItems(category);
        if (categoryItems.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>
                Sección {category}: {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      {category === "C" && (
                        <>
                          <TableHead className="text-center">Monto</TableHead>
                          <TableHead className="text-center">Fase</TableHead>
                          <TableHead className="text-center">% Ejec.</TableHead>
                        </>
                      )}
                      <TableHead className="text-center">Puntos</TableHead>
                      <TableHead className="text-center">Evidencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryItems.map((item) => (
                      <>
                        <TableRow key={item.id || `${item.indicator_name}-${item.category}`}>
                          <TableCell className="font-medium">{item.indicator_name}</TableCell>
                          <TableCell className="text-center">
                            {category === "D" ? "-" : item.quantity || 0}
                          </TableCell>
                          {category === "C" && (
                            <>
                              <TableCell className="text-center">
                                ${item.monto?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.fase || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.porcentaje_ejecucion || 0}%
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-center font-semibold text-primary">
                            {item.score_obtained}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.evidence_url || (item as any).evidence_details ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => item.evidence_url && openSignedUrl('evaluation-evidence', item.evidence_url)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">Sin evidencia</span>
                            )}
                          </TableCell>
                        </TableRow>
                        {category === "D" && item.justification && (
                          <TableRow key={`${item.id || item.indicator_name}-justification`}>
                            <TableCell colSpan={4} className="text-sm">
                              <span className="font-medium">Justificación:</span> {item.justification}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Submit Button */}
      <Card className={`border-2 ${canSubmit ? "border-green-500/20 bg-green-50 dark:bg-green-950/20" : "border-orange-500/20 bg-orange-50 dark:bg-orange-950/20"}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {canSubmit ? (
                <>
                  Al enviar, su evaluación será sometida para revisión por el equipo administrativo.
                  <br />
                  No podrá realizar cambios después del envío.
                </>
              ) : (
                <>
                  Complete todos los campos obligatorios y alcance 100 puntos para enviar la evaluación.
                  <br />
                  Faltan {100 - totalScore} puntos para completar.
                </>
              )}
            </p>
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting || !canSubmit || (reportStatus !== "draft" && reportStatus !== "observado")}
              className={canSubmit ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting ? "Enviando..." : canSubmit ? "Enviar Evaluación Final" : "Complete 100 puntos para enviar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Justification Dialog */}
      <EditJustificationDialog
        open={justificationDialogOpen}
        onOpenChange={setJustificationDialogOpen}
        onConfirm={handleJustificationConfirm}
        isLoading={enableEditMutation.isPending}
      />
    </div>
  );
}