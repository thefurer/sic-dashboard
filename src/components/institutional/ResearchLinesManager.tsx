import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResearchLinesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLines: string[];
  settingsId: string;
}

export function ResearchLinesManager({
  open,
  onOpenChange,
  currentLines,
  settingsId,
}: ResearchLinesManagerProps) {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<string[]>(currentLines);
  const [newLine, setNewLine] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (updatedLines: string[]) => {
      const { error } = await supabase
        .from("app_settings")
        .update({ research_lines: updatedLines })
        .eq("id", settingsId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutional-settings"] });
      toast.success("Líneas de investigación actualizadas");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Error al actualizar");
    },
  });

  const handleAddLine = () => {
    if (!newLine.trim()) {
      toast.error("Ingrese un nombre válido");
      return;
    }
    const updatedLines = [...lines, newLine.trim()];
    setLines(updatedLines);
    setNewLine("");
  };

  const handleDeleteLine = (index: number) => {
    const updatedLines = lines.filter((_, i) => i !== index);
    setLines(updatedLines);
  };

  const handleSave = () => {
    if (lines.length === 0) {
      toast.error("Debe haber al menos una línea de investigación");
      return;
    }
    updateMutation.mutate(lines);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Líneas de Investigación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new line */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-line">Nueva Línea</Label>
              <Input
                id="new-line"
                value={newLine}
                onChange={(e) => setNewLine(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLine()}
                placeholder="Ej: Inteligencia Artificial"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAddLine}
              variant="outline"
              className="self-end"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>

          {/* Current lines list */}
          <div className="space-y-2">
            <Label>Líneas Actuales ({lines.length})</Label>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-2">
                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{line}</span>
                    <Button
                      onClick={() => handleDeleteLine(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
