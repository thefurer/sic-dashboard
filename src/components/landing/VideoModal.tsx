import { useState } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface VideoModalProps {
  videoUrl?: string;
}

export function VideoModal({ videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ" }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(true)}
        className="group px-8 py-6 text-lg rounded-full border-2 border-slate-300 dark:border-white/20 hover:border-primary dark:hover:border-primary bg-white/50 dark:bg-white/5 backdrop-blur-sm transition-all hover:shadow-lg"
      >
        <span className="relative flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-primary text-white group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        </span>
        Ver Demo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <VisuallyHidden>
            <DialogTitle>Video de demostración de GISICF</DialogTitle>
          </VisuallyHidden>
          
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="aspect-video w-full">
            <iframe
              src={videoUrl}
              title="GISICF Demo"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
