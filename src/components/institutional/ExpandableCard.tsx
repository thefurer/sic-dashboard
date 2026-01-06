import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  maxHeight?: number;
  actions?: React.ReactNode;
  iconColorClass?: string;
}

export const ExpandableCard = ({
  icon,
  title,
  content,
  maxHeight = 80,
  actions,
  iconColorClass = "bg-primary/30",
}: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content && content.length > 150;

  return (
    <div className="glass-card group hover:shadow-xl transition-all duration-300 p-5 rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <div className={cn(
            "absolute inset-0 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            iconColorClass
          )} />
          <div className="relative p-2 rounded-xl bg-muted/50">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{ 
              maxHeight: isExpanded ? "none" : `${maxHeight}px`,
            }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content || "No definido"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Gradient fade when collapsed */}
        {shouldTruncate && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Ver más / Ver menos button */}
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full text-primary hover:text-primary hover:bg-primary/10 gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver más
            </>
          )}
        </Button>
      )}

      {/* Actions slot */}
      {actions && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {actions}
        </div>
      )}
    </div>
  );
};
