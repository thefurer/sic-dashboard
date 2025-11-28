import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import PublicacionStep from "@/components/evaluation/PublicacionStep";
import TransferenciaStep from "@/components/evaluation/TransferenciaStep";
import RecursosStep from "@/components/evaluation/RecursosStep";
import ImpactosStep from "@/components/evaluation/ImpactosStep";
import ReviewStep from "@/components/evaluation/ReviewStep";
import confetti from "canvas-confetti";

const STEPS = [
  { id: 1, name: "Publicación", maxScore: 45, category: "A" },
  { id: 2, name: "Transferencia", maxScore: 10, category: "B" },
  { id: 3, name: "Recursos", maxScore: 15, category: "C" },
  { id: 4, name: "Impactos", maxScore: 30, category: "D" },
  { id: 5, name: "Revisión y Envío", maxScore: 0, category: "Review" },
];

export default function Evaluation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId, setReportId] = useState<string | null>(null);
  const [evaluationItems, setEvaluationItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Calculate score using saturation logic
  const calculateSaturatedScore = () => {
    if (!evaluationItems || evaluationItems.length === 0) return 0;
    
    // Section A: Publication (Max 45)
    const projects = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Proyecto'));
    const articlesJCR = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('JCR'));
    const books = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Libro'));
    const regional = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Regional'));
    const papers = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Ponencia'));
    
    const scoreA = Math.min(
      (projects.length > 0 ? 15 : 0) +
      (articlesJCR.length > 0 ? 10 : 0) +
      (books.length > 0 ? 10 : 0) +
      (regional.length > 0 ? 5 : 0) +
      (papers.length > 0 ? 5 : 0),
      45
    );
    
    // Section B: Transfer (Max 10)
    const vinculacion = evaluationItems.filter(i => i.category === 'B');
    const scoreB = Math.min(vinculacion.length > 0 ? 10 : 0, 10);
    
    // Section C: Resources (Max 15)
    const convocatorias = evaluationItems.filter(i => i.category === 'C');
    const scoreC = Math.min(convocatorias.length > 0 ? 15 : 0, 15);
    
    // Section D: Impacts (Max 30)
    const impactSocial = evaluationItems.filter(i => i.category === 'D' && i.indicator_name?.includes('Social'));
    const impactEnv = evaluationItems.filter(i => i.category === 'D' && i.indicator_name?.includes('Ambiental'));
    const impactEcon = evaluationItems.filter(i => i.category === 'D' && i.indicator_name?.includes('Económico'));
    
    const scoreD = Math.min(
      (impactSocial.length > 0 ? 10 : 0) +
      (impactEnv.length > 0 ? 10 : 0) +
      (impactEcon.length > 0 ? 10 : 0),
      30
    );
    
    return Math.min(scoreA + scoreB + scoreC + scoreD, 100);
  };

  const totalScore = calculateSaturatedScore();

  // Fetch or create draft report (or load submitted/observado report for editing)
  const { data: existingReport, isLoading } = useQuery({
    queryKey: ["evaluation-report", new Date().getFullYear()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentYear = new Date().getFullYear();
      
      // Try to find draft, observado, or submitted (read-only)
      const { data, error } = await supabase
        .from("evaluation_reports")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .in("status", ["draft", "submitted", "observado", "approved"])
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newReport, error: createError } = await supabase
          .from("evaluation_reports")
          .insert({
            user_id: user.id,
            group_id: user.id,
            year: currentYear,
            status: "draft",
            total_score: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newReport;
      }

      return data;
    },
  });

  // Fetch evaluation items - Force fresh data on every mount
  const { data: items } = useQuery({
    queryKey: ["evaluation-items", reportId],
    queryFn: async () => {
      if (!reportId) return [];
      
      const { data, error } = await supabase
        .from("evaluation_items")
        .select("*")
        .eq("report_id", reportId);

      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (existingReport) {
      setReportId(existingReport.id);
    }
  }, [existingReport]);

  useEffect(() => {
    if (items) {
      // Only set items if they exist, ensuring empty array means zero score
      setEvaluationItems(items.length > 0 ? items : []);
    }
  }, [items]);

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (items: any[]) => {
      if (!reportId) throw new Error("No report ID");

      const totalScore = items.reduce((sum, item) => sum + (item.score_obtained || 0), 0);

      const { error: updateError } = await supabase
        .from("evaluation_reports")
        .update({ total_score: totalScore })
        .eq("id", reportId);

      if (updateError) throw updateError;

      return totalScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-report"] });
      queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
    },
  });

  // Submit final report mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!reportId) throw new Error("No report ID");

      const { error } = await supabase
        .from("evaluation_reports")
        .update({ 
          status: "submitted",
          submitted_at: new Date().toISOString()
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      
      toast.success("¡Evaluación enviada exitosamente!", {
        description: "Su informe ha sido sometido para revisión.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast.error("Error al enviar evaluación", {
        description: error.message,
      });
    },
  });

  const handleNext = async () => {
    // Don't save if already submitted or approved (read-only mode)
    const isReadOnly = existingReport?.status === "submitted" || existingReport?.status === "approved";
    if (!isReadOnly) {
      await saveDraftMutation.mutateAsync(evaluationItems);
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    await submitMutation.mutateAsync();
  };

  const getStepScore = (category: string) => {
    if (!evaluationItems || evaluationItems.length === 0) return 0;
    
    if (category === 'A') {
      const projects = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Proyecto'));
      const articlesJCR = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('JCR'));
      const books = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Libro'));
      const regional = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Regional'));
      const papers = evaluationItems.filter(i => i.category === 'A' && i.indicator_name?.includes('Ponencia'));
      
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
      const vinculacion = evaluationItems.filter(i => i.category === 'B');
      return Math.min(vinculacion.length > 0 ? 10 : 0, 10);
    }
    
    if (category === 'C') {
      const convocatorias = evaluationItems.filter(i => i.category === 'C');
      return Math.min(convocatorias.length > 0 ? 15 : 0, 15);
    }
    
    if (category === 'D') {
      const impactSocial = evaluationItems.filter(i => i.category === 'D' && i.indicator_name?.includes('Social'));
      const impactEnv = evaluationItems.filter(i => i.category === 'D' && i.indicator_name?.includes('Ambiental'));
      const impactEcon = evaluationItems.filter(i => i.category === 'D' && i.indicator_name?.includes('Económico'));
      
      return Math.min(
        (impactSocial.length > 0 ? 10 : 0) +
        (impactEnv.length > 0 ? 10 : 0) +
        (impactEcon.length > 0 ? 10 : 0),
        30
      );
    }
    
    return 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  const currentStepData = STEPS[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-24">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Evaluación Anual {new Date().getFullYear()}
          </h1>
          <p className="text-muted-foreground">
            Complete todos los pasos para enviar su informe de evaluación
          </p>

          {/* Correction Alert Banner */}
          {existingReport?.status === "observado" && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">!</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Correcciones Solicitadas
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                    {existingReport.admin_observations || "El administrador ha solicitado correcciones en su evaluación."}
                  </p>
                  {existingReport.correction_deadline && (
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Fecha límite: {new Date(existingReport.correction_deadline).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <Card className="p-6 mb-8">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${
                    index < STEPS.length - 1 ? "relative" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground scale-110"
                        : currentStep > step.id || (step.maxScore > 0 && getStepScore(step.category) === step.maxScore)
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id || (step.maxScore > 0 && getStepScore(step.category) === step.maxScore) ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === step.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                    {step.maxScore > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {getStepScore(step.category)}/{step.maxScore} pts
                      </p>
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                        currentStep > step.id ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="mt-6" />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Paso {currentStep} de {STEPS.length}
            </span>
            <span className="font-bold text-lg text-primary">
              Puntuación Total: {totalScore}/100
            </span>
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8">
          {currentStep === 1 && (
            <PublicacionStep
              reportId={reportId}
              items={evaluationItems.filter((item) => item.category === "A")}
              onItemsChange={setEvaluationItems}
            />
          )}
          {currentStep === 2 && (
            <TransferenciaStep
              reportId={reportId}
              items={evaluationItems.filter((item) => item.category === "B")}
              onItemsChange={setEvaluationItems}
            />
          )}
          {currentStep === 3 && (
            <RecursosStep
              reportId={reportId}
              items={evaluationItems.filter((item) => item.category === "C")}
              onItemsChange={setEvaluationItems}
            />
          )}
          {currentStep === 4 && (
            <ImpactosStep
              reportId={reportId}
              items={evaluationItems.filter((item) => item.category === "D")}
              onItemsChange={setEvaluationItems}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep
              items={evaluationItems}
              totalScore={totalScore}
              onSubmit={handleSubmit}
              isSubmitting={submitMutation.isPending}
              reportStatus={existingReport?.status || "draft"}
              reportId={reportId}
            />
          )}
        </Card>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center w-full mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || saveDraftMutation.isPending}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={existingReport?.status === "submitted" || existingReport?.status === "approved" || saveDraftMutation.isPending}
            >
              {saveDraftMutation.isPending ? "Guardando..." : "Siguiente"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
              existingReport?.status === "submitted" || existingReport?.status === "approved" ? (
                <div className="text-sm text-muted-foreground">
                  {existingReport?.status === "approved" ? "Evaluación aprobada" : "Evaluación ya enviada"}
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || totalScore !== 100}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitMutation.isPending 
                    ? "Enviando..." 
                    : totalScore !== 100 
                    ? `Complete 100 puntos (${totalScore}/100)` 
                    : "Enviar Evaluación Final"}
                </Button>
              )
            )}
        </div>
      </div>
    </div>
  );
}
