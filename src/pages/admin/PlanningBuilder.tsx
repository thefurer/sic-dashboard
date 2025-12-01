import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { PlanningGeneralStep } from "@/components/planning/PlanningGeneralStep";
import { PlanningTeamStep } from "@/components/planning/PlanningTeamStep";
import { PlanningActivitiesStep } from "@/components/planning/PlanningActivitiesStep";
import { PlanningPreviewStep } from "@/components/planning/PlanningPreviewStep";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: "Datos Generales", component: PlanningGeneralStep },
  { id: 2, title: "Conformación del Equipo", component: PlanningTeamStep },
  { id: 3, title: "Cronograma de Actividades", component: PlanningActivitiesStep },
  { id: 4, title: "Previsualización y Exportar", component: PlanningPreviewStep },
];

export default function PlanningBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [planId, setPlanId] = useState<string | null>(id || null);

  const CurrentStepComponent = STEPS[currentStep].component;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin/planning")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Planificaciones
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {id ? "Editar Planificación" : "Nueva Planificación Estratégica"}
        </h1>
      </div>

      {/* Steps Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index < currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStep
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                planId={planId}
                setPlanId={setPlanId}
                onNext={handleNext}
                onBack={handleBack}
                isFirstStep={currentStep === 0}
                isLastStep={currentStep === STEPS.length - 1}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
