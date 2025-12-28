import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, X, Sparkles, MapPin } from "lucide-react";
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

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay({
  isActive,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose,
}: TourOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Find and highlight target element
  const updateHighlight = useCallback(() => {
    if (!step?.target) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      setHighlightRect(null);
    }
  }, [step?.target]);

  useEffect(() => {
    if (isActive && step) {
      // Small delay to let the page render after navigation
      const timer = setTimeout(updateHighlight, 300);
      window.addEventListener("resize", updateHighlight);
      window.addEventListener("scroll", updateHighlight);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateHighlight);
        window.removeEventListener("scroll", updateHighlight);
      };
    }
  }, [isActive, step, updateHighlight, currentStep]);

  if (!isActive || !step) return null;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <>
          {/* Backdrop with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{
              background: highlightRect
                ? `radial-gradient(ellipse ${highlightRect.width + 40}px ${highlightRect.height + 40}px at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top + highlightRect.height / 2}px, transparent 0%, rgba(0,0,0,0.75) 100%)`
                : "rgba(0,0,0,0.75)",
            }}
          />
          
          {/* Click blocker */}
          <div 
            className="fixed inset-0 z-[100]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />

          {/* Highlight border animation */}
          {highlightRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed z-[101] pointer-events-none"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            >
              <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-primary/10" />
              {/* Corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br-lg" />
            </motion.div>
          )}

          {/* Tour Card - Centered and responsive */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[102] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg mx-auto"
          >
            <div className="relative bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 z-10 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Robot Avatar */}
                <div className="flex justify-center mb-5">
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full scale-150" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-xl shadow-primary/40 ring-4 ring-primary/20">
                      <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Robot Message Bubble */}
                <motion.div
                  key={`bubble-${step.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-5 relative"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/10 border-l border-t border-primary/20 rotate-45" />
                  <p className="text-sm sm:text-base text-center italic text-muted-foreground leading-relaxed">
                    "{step.robotMessage}"
                  </p>
                </motion.div>

                {/* Current page indicator */}
                {step.route && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 mb-3 text-xs text-primary"
                  >
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium">{step.route}</span>
                  </motion.div>
                )}

                {/* Step Content */}
                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span className="font-medium">Paso {currentStep + 1} de {steps.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2.5" />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={isFirstStep}
                    className="flex-1 h-11"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  
                  {isLastStep ? (
                    <Button
                      onClick={onClose}
                      className="flex-1 h-11 bg-primary hover:bg-primary/90"
                    >
                      ¡Comenzar!
                      <Sparkles className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={onNext}
                      className="flex-1 h-11 bg-primary hover:bg-primary/90"
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
                  className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground"
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
