import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VinculacionDialog, { VinculacionEntry } from "./VinculacionDialog";

interface EvaluationItem {
  id?: string;
  report_id: string;
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_details?: any;
}

interface TransferenciaStepProps {
  reportId: string | null;
  items: EvaluationItem[];
  onItemsChange: (items: any[]) => void;
}

const INDICATORS = [
  { name: "Proyectos de Vinculación", points: 10, unitScore: 5 },
];

export default function TransferenciaStep({ reportId, items, onItemsChange }: TransferenciaStepProps) {
  const [vinculacionDialogOpen, setVinculacionDialogOpen] = useState(false);
  const [editingVinculacion, setEditingVinculacion] = useState<VinculacionEntry | null>(null);
  const queryClient = useQueryClient();

  const saveItemMutation = useMutation({
    mutationFn: async (item: EvaluationItem) => {
      const existingItem = items.find((i) => i.indicator_name === item.indicator_name);

      if (existingItem?.id) {
        const { error } = await supabase
          .from("evaluation_items")
          .update({
            score_obtained: item.score_obtained,
            evidence_details: item.evidence_details,
          })
          .eq("id", existingItem.id);

        if (error) throw error;
        return { ...existingItem, ...item };
      } else {
        const { data, error } = await supabase
          .from("evaluation_items")
          .insert(item)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
    },
  });

  const handleSaveVinculacion = async (entry: VinculacionEntry) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === "Proyectos de Vinculación");
    const existingEntries: VinculacionEntry[] = existingItem?.evidence_details || [];

    let updatedEntries: VinculacionEntry[];
    if (entry.id) {
      updatedEntries = existingEntries.map((e) => (e.id === entry.id ? entry : e));
    } else {
      updatedEntries = [...existingEntries, { ...entry, id: crypto.randomUUID() }];
    }

    // Award MAX points if at least 1 entry exists
    const score = updatedEntries.length > 0 ? 10 : 0;

    const item: EvaluationItem = {
      report_id: reportId,
      category: "B",
      indicator_name: "Proyectos de Vinculación",
      score_obtained: score,
      evidence_details: updatedEntries,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== "Proyectos de Vinculación");
    onItemsChange([...updatedItems, item]);

    toast.success("Proyecto de vinculación guardado");
    setEditingVinculacion(null);
  };

  const handleDeleteVinculacion = async (entryId: string) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === "Proyectos de Vinculación");
    const existingEntries: VinculacionEntry[] = existingItem?.evidence_details || [];
    const updatedEntries = existingEntries.filter((e) => e.id !== entryId);

    try {
      if (updatedEntries.length === 0 && existingItem?.id) {
        // Delete the entire evaluation_item row if no entries remain
        const { error } = await supabase
          .from("evaluation_items")
          .delete()
          .eq("id", existingItem.id)
          .eq("report_id", reportId);

        if (error) {
          console.error("Delete vinculacion error:", error);
          toast.error("Error al eliminar", { description: error.message });
          return;
        }

        // Force immediate refetch
        await queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
        await queryClient.refetchQueries({ queryKey: ["evaluation-items"] });
        
        const updatedItems = items.filter((i) => i.id !== existingItem.id);
        onItemsChange(updatedItems);
      } else {
        const score = updatedEntries.length > 0 ? 10 : 0;

        const item: EvaluationItem = {
          report_id: reportId,
          category: "B",
          indicator_name: "Proyectos de Vinculación",
          score_obtained: score,
          evidence_details: updatedEntries,
        };

        await saveItemMutation.mutateAsync(item);

        const updatedItems = items.filter((i) => i.indicator_name !== "Proyectos de Vinculación");
        onItemsChange([...updatedItems, item]);
      }

      toast.success("Entrada eliminada");
    } catch (err: any) {
      console.error("Delete vinculacion error:", err);
      toast.error("Error al eliminar", { description: err.message });
    }
  };

  const getItemData = (indicatorName: string) => {
    return items.find((i) => i.indicator_name === indicatorName) || {
      score_obtained: 0,
      evidence_details: [],
    };
  };

  const totalScore = items
    .filter((item) => item.category === "B")
    .reduce((sum, item) => sum + (item.score_obtained || 0), 0);

  const vinculacionData = getItemData("Proyectos de Vinculación");
  const vinculacionEntries: VinculacionEntry[] = vinculacionData.evidence_details || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Transferencia de Tecnología</h2>
        <p className="text-muted-foreground">Sección B - Máximo 10 puntos</p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-lg font-semibold text-primary">Puntos Sección B: {totalScore}/10</p>
      </div>

      <div className="space-y-4">
        {/* Proyectos de Vinculación */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Proyectos de Vinculación</span>
              <span className="text-primary text-sm">
                {vinculacionData.score_obtained}/10 pts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setEditingVinculacion(null);
                setVinculacionDialogOpen(true);
              }}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Proyecto de Vinculación
            </Button>

            {vinculacionEntries.length > 0 && (
              <div className="space-y-2">
                {vinculacionEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.project_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.evidences.length} evidencia(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingVinculacion(entry);
                          setVinculacionDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVinculacion(entry.id!)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <VinculacionDialog
        open={vinculacionDialogOpen}
        onOpenChange={setVinculacionDialogOpen}
        onSave={handleSaveVinculacion}
        editingEntry={editingVinculacion}
        reportId={reportId || ""}
      />
    </div>
  );
}
