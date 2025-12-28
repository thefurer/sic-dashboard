import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTourGuide } from "@/hooks/useTourGuide";
import { useUserRole } from "@/hooks/useUserRole";
import { TourOverlay } from "./TourOverlay";
import { userTourSteps, adminTourSteps } from "./TourSteps";

interface TourContextType {
  startTour: () => void;
  hasSeenTour: boolean;
  isTourActive: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  // Return default values if context is not available yet
  if (!context) {
    return {
      startTour: () => {},
      hasSeenTour: true,
      isTourActive: false,
    };
  }
  return context;
}

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userRole } = useUserRole();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    isTourActive,
    currentStep,
    hasSeenTour,
    startTour,
    endTour,
    nextStep,
    prevStep,
  } = useTourGuide();

  const isAdmin = userRole === "admin";
  const steps = isAdmin ? adminTourSteps : userTourSteps;
  const currentStepData = steps[currentStep];

  // Navigate to the correct route when step changes
  useEffect(() => {
    if (isTourActive && currentStepData?.route) {
      // Clear any pending navigation
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Only navigate if we're not already on the correct route
      if (location.pathname !== currentStepData.route) {
        navigationTimeoutRef.current = setTimeout(() => {
          navigate(currentStepData.route!);
        }, 100);
      }
    }

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [isTourActive, currentStep, currentStepData?.route, location.pathname, navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      endTour();
    }
  };

  const handleStartTour = () => {
    // Navigate to starting route first
    if (steps[0]?.route && location.pathname !== steps[0].route) {
      navigate(steps[0].route);
    }
    // Small delay to let navigation complete
    setTimeout(() => {
      startTour();
    }, 200);
  };

  return (
    <TourContext.Provider value={{ startTour: handleStartTour, hasSeenTour, isTourActive }}>
      {children}
      <TourOverlay
        isActive={isTourActive}
        currentStep={currentStep}
        steps={steps}
        onNext={handleNext}
        onPrev={prevStep}
        onClose={endTour}
      />
    </TourContext.Provider>
  );
}
