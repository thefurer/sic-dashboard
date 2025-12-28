import { createContext, useContext, ReactNode } from "react";
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
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { data: userRole } = useUserRole();
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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      endTour();
    }
  };

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour, isTourActive }}>
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
