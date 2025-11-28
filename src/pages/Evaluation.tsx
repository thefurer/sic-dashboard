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
  { id: 2, name: "Transferencia", maxScore: 20, category: "B" },
  { id: 3, name: "Recursos", maxScore: 15, category: "C" },
  { id: 4, name: "Impactos", maxScore: 20, category: "D" },
  { id: 5, name: "Revisión y Envío", maxScore: 0, category: "Review" },
];

export default function Evaluation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId, setReportId] = useState<string | null>(null);
  const [evaluationItems, setEvaluationItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch or create draft report
  const { data: existingReport, isLoading } = useQuery({
    queryKey: ["evaluation-report", new Date().getFullYear()],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from("evaluation_reports")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .eq("status", "draft")
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

  // Fetch evaluation items
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
  });

  useEffect(() => {
    if (existingReport) {
      setReportId(existingReport.id);
    }
  }, [existingReport]);

  useEffect(() => {
    if (items) {
      setEvaluationItems(items);
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
    await saveDraftMutation.mutateAsync(evaluationItems);
    
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
    return evaluationItems
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + (item.score_obtained || 0), 0);
  };

  const totalScore = evaluationItems.reduce(
    (sum, item) => sum + (item.score_obtained || 0),
    0
  );

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
                        : currentStep > step.id
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
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
            />
          )}
        </Card>

        {/* Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg">
          <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
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
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending ? "Guardando..." : "Siguiente"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
