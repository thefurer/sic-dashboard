import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditJustificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (justification: string) => void;
  isLoading?: boolean;
}

export default function EditJustificationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: EditJustificationDialogProps) {
  const [justification, setJustification] = useState("");

  const handleConfirm = () => {
    if (justification.trim().length < 10) {
      return;
    }
    onConfirm(justification);
    setJustification("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Justificación de Cambios</DialogTitle>
          <DialogDescription>
            Este reporte ya ha sido enviado. Por favor explique por qué necesita editarlo.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Los cambios realizados serán notificados al administrador y marcados como "Editado después de envío".
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="justification">
              Justificación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justification"
              placeholder="Explique por qué está editando este reporte ya enviado..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres. Caracteres actuales: {justification.length}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setJustification("");
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={justification.trim().length < 10 || isLoading}
          >
            {isLoading ? "Guardando..." : "Confirmar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
