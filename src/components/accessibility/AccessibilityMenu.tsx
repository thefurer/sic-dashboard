import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  Minus,
  Plus,
  Contrast,
  Link2,
  Sparkles,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  highlightLinks: boolean;
  disableAnimations: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "medium",
  highContrast: false,
  highlightLinks: false,
  disableAnimations: false,
};

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));

    // Font size
    const root = document.documentElement;
    switch (settings.fontSize) {
      case "small":
        root.style.fontSize = "14px";
        break;
      case "medium":
        root.style.fontSize = "16px";
        break;
      case "large":
        root.style.fontSize = "18px";
        break;
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Highlight links
    if (settings.highlightLinks) {
      root.classList.add("highlight-links");
    } else {
      root.classList.remove("highlight-links");
    }

    // Disable animations
    if (settings.disableAnimations) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [settings]);

  const handleFontSize = (direction: "decrease" | "increase") => {
    const sizes: AccessibilitySettings["fontSize"][] = ["small", "medium", "large"];
    const currentIndex = sizes.indexOf(settings.fontSize);
    
    if (direction === "decrease" && currentIndex > 0) {
      setSettings({ ...settings, fontSize: sizes[currentIndex - 1] });
    } else if (direction === "increase" && currentIndex < sizes.length - 1) {
      setSettings({ ...settings, fontSize: sizes[currentIndex + 1] });
    }
  };

  const toggleSetting = (key: keyof Omit<AccessibilitySettings, "fontSize">) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const getFontSizeLabel = () => {
    switch (settings.fontSize) {
      case "small":
        return "P";
      case "medium":
        return "M";
      case "large":
        return "G";
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
        aria-label="Abrir menú de accesibilidad"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Accessibility panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-6 z-50 w-72 rounded-2xl bg-card border border-border shadow-xl p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Herramientas de Accesibilidad
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Font size control */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Fuente</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleFontSize("decrease")}
                  disabled={settings.fontSize === "small"}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {getFontSizeLabel()}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleFontSize("increase")}
                  disabled={settings.fontSize === "large"}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Toggle buttons grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={settings.highContrast ? "default" : "outline"}
                className={cn(
                  "h-10 justify-start gap-2 text-sm",
                  settings.highContrast && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleSetting("highContrast")}
              >
                <Contrast className="h-4 w-4" />
                Contraste
              </Button>
              <Button
                variant={settings.highlightLinks ? "default" : "outline"}
                className={cn(
                  "h-10 justify-start gap-2 text-sm",
                  settings.highlightLinks && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleSetting("highlightLinks")}
              >
                <Link2 className="h-4 w-4" />
                Enlaces
              </Button>
              <Button
                variant={settings.disableAnimations ? "default" : "outline"}
                className={cn(
                  "h-10 justify-start gap-2 text-sm col-span-2",
                  settings.disableAnimations && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleSetting("disableAnimations")}
              >
                <Sparkles className="h-4 w-4" />
                Sin animaciones
              </Button>
            </div>

            {/* Reset button */}
            <Button
              variant="ghost"
              className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={resetSettings}
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
