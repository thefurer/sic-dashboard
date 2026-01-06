import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  icon: React.ReactNode;
  title: string;
  downloadUrl?: string | null;
  isAdmin: boolean;
  uploading: boolean;
  fieldName: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconColorClass?: string;
}

export const DocumentCard = ({
  icon,
  title,
  downloadUrl,
  isAdmin,
  uploading,
  fieldName,
  onUpload,
  iconColorClass = "bg-primary/30",
}: DocumentCardProps) => {
  return (
    <div className="glass-card group hover:shadow-xl transition-all duration-300 p-4 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className={cn(
            "absolute inset-0 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            iconColorClass
          )} />
          <div className="relative">
            {icon}
          </div>
        </div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>

      {/* Download button or not available */}
      <div className="flex-1 flex flex-col justify-center">
        {downloadUrl ? (
          <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </a>
          </Button>
        ) : (
          <p className="text-xs text-center text-muted-foreground py-2">
            No disponible
          </p>
        )}
      </div>

      {/* Admin upload */}
      {isAdmin && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          <Input
            type="file"
            accept=".pdf"
            onChange={onUpload}
            disabled={uploading}
            className="text-xs bg-muted/50 border-border file:mr-2 file:text-xs"
          />
          {uploading && (
            <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
          )}
        </div>
      )}
    </div>
  );
};
