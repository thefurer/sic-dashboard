import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const TOUR_COMPLETED_KEY = "gisicf_tour_completed";

export function useTourGuide() {
  const { user } = useAuth();
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    if (user) {
      const tourKey = `${TOUR_COMPLETED_KEY}_${user.id}`;
      const completed = localStorage.getItem(tourKey);
      setHasSeenTour(!!completed);
      
      // Auto-start tour for new users after a small delay
      if (!completed) {
        const timer = setTimeout(() => {
          setIsTourActive(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentStep(0);
    if (user) {
      const tourKey = `${TOUR_COMPLETED_KEY}_${user.id}`;
      localStorage.setItem(tourKey, "true");
      setHasSeenTour(true);
    }
  }, [user]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return {
    isTourActive,
    currentStep,
    hasSeenTour,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
  };
}
