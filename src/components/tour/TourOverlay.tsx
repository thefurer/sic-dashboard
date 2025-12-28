import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronLeft, ChevronRight, X, Sparkles, MapPin, Eye, Zap } from "lucide-react";
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

// Sound effects
const playSound = (type: 'next' | 'prev' | 'complete' | 'start') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'next':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'prev':
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'complete':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
      case 'start':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.25);
        break;
    }
  } catch (e) {}
};

const getPositionClasses = (position: TourStep["position"]) => {
  switch (position) {
    case "top-left":
      return "top-4 left-4";
    case "top-right":
      return "top-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    case "bottom-right":
      return "bottom-4 right-4";
    case "center":
    default:
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
};

export function TourOverlay({
  isActive,
  currentStep,
  steps,
  onNext,
  onPrev,
  onClose,
}: TourOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStepRef = useRef<number>(-1);
  const hasPlayedStartSound = useRef(false);
  
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle transition animation
  useEffect(() => {
    if (prevStepRef.current !== -1 && prevStepRef.current !== currentStep) {
      // Different route - minimize and show page
      const prevRoute = steps[prevStepRef.current]?.route;
      const currentRoute = step?.route;
      
      if (prevRoute !== currentRoute) {
        setIsMinimized(true);
        setIsTransitioning(true);
        
        // Auto expand after showing the page
        const timer = setTimeout(() => {
          setIsMinimized(false);
          setIsTransitioning(false);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, step?.route, steps]);

  // Play sound effects
  useEffect(() => {
    if (!isActive) {
      hasPlayedStartSound.current = false;
      prevStepRef.current = -1;
      return;
    }

    if (!hasPlayedStartSound.current && currentStep === 0) {
      playSound('start');
      hasPlayedStartSound.current = true;
      prevStepRef.current = 0;
      return;
    }

    if (prevStepRef.current !== -1 && prevStepRef.current !== currentStep) {
      if (currentStep > prevStepRef.current) {
        playSound('next');
      } else {
        playSound('prev');
      }
    }
    prevStepRef.current = currentStep;
  }, [isActive, currentStep]);

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
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      });
    } else {
      setHighlightRect(null);
    }
  }, [step?.target]);

  useEffect(() => {
    if (isActive && step) {
      const timer = setTimeout(updateHighlight, 400);
      window.addEventListener("resize", updateHighlight);
      window.addEventListener("scroll", updateHighlight);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateHighlight);
        window.removeEventListener("scroll", updateHighlight);
      };
    }
  }, [isActive, step, updateHighlight, currentStep]);

  const handleNext = () => {
    onNext();
  };

  const handlePrev = () => {
    onPrev();
  };

  const handleClose = () => {
    if (isLastStep) {
      playSound('complete');
    }
    onClose();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isActive || !step) return null;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <>
          {/* Highlight border - NO backdrop blur */}
          {highlightRect && !isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[100] pointer-events-none"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            >
              <motion.div 
                animate={{ 
                  boxShadow: [
                    "0 0 0 2px hsl(var(--primary))",
                    "0 0 20px 4px hsl(var(--primary) / 0.5)",
                    "0 0 0 2px hsl(var(--primary))"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-lg"
              />
            </motion.div>
          )}

          {/* Minimized Robot Button */}
          <AnimatePresence>
            {isMinimized && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={toggleMinimize}
                className="fixed bottom-6 right-6 z-[102] w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer hover:scale-110 transition-transform"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    y: [0, -2, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bot className="h-7 w-7 text-primary-foreground" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-yellow-900">{currentStep + 1}</span>
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Compact Tour Card */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                key={`panel-${step.id}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`fixed z-[101] w-[320px] ${getPositionClasses(step.position)}`}
              >
                <div className="relative bg-background/95 backdrop-blur-sm border-2 border-primary/30 rounded-xl shadow-xl overflow-hidden">
                  {/* Animated Robot Header */}
                  <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-3 flex items-center gap-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, -5, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                        <motion.div
                          animate={{ 
                            y: [0, -2, 0],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity }
                        }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                      </motion.div>
                      {/* Antenna animation */}
                      <motion.div
                        animate={{ scaleY: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-primary rounded-full"
                      />
                      <motion.div
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                      />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground italic truncate">
                        "{step.robotMessage}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMinimize}
                        className="h-7 w-7 hover:bg-primary/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {/* Route indicator */}
                    {step.route && (
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] text-primary">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{step.route}</span>
                        {isTransitioning && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="h-3 w-3 text-yellow-500" />
                          </motion.div>
                        )}
                      </div>
                    )}

                    <h3 className="text-sm font-bold mb-1 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {step.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Paso {currentStep + 1}/{steps.length}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={isFirstStep}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" />
                        Ant.
                      </Button>
                      
                      {isLastStep ? (
                        <Button
                          onClick={handleClose}
                          size="sm"
                          className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                        >
                          ¡Listo!
                          <Sparkles className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          size="sm"
                          className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
                        >
                          Sig.
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
