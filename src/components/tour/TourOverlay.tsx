import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TourStep } from "./TourSteps";

interface TourOverlayProps {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function TourOverlay({
  isActive,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose,
}: TourOverlayProps) {
  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md"
          >
            <div className="relative bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 z-10 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Content */}
              <div className="relative p-6">
                {/* Robot Avatar */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                      <Bot className="h-10 w-10 text-primary-foreground" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Robot Message Bubble */}
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 relative"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/10 border-l border-t border-primary/20 rotate-45" />
                  <p className="text-sm text-center italic text-muted-foreground">
                    "{step.robotMessage}"
                  </p>
                </motion.div>

                {/* Step Content */}
                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Paso {currentStep + 1} de {steps.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={isFirstStep}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  
                  {isLastStep ? (
                    <Button
                      onClick={onClose}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      ¡Comenzar!
                      <Sparkles className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={onNext}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>

                {/* Skip button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  Saltar tour
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
