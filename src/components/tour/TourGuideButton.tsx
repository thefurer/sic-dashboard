import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface TourGuideButtonProps {
  onClick: () => void;
  hasSeenTour: boolean;
}

export function TourGuideButton({ onClick, hasSeenTour }: TourGuideButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="relative hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <motion.div
              animate={!hasSeenTour ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Bot className="h-5 w-5 text-primary" />
            </motion.div>
            {!hasSeenTour && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
              >
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
              </motion.span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Asistente de Tour Guiado</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
