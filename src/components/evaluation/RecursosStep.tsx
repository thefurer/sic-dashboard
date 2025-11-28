import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ConvocatoriaDialog, { ConvocatoriaEntry } from "./ConvocatoriaDialog";

interface EvaluationItem {
  id?: string;
  report_id: string;
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_details?: any;
}

interface RecursosStepProps {
  reportId: string | null;
  items: EvaluationItem[];
  onItemsChange: (items: any[]) => void;
}

const INDICATORS = [
  { name: "Convocatorias Internacionales", points: 10, unitScore: 10 },
  { name: "Convocatorias Nacionales", points: 5, unitScore: 5 },
];

export default function RecursosStep({ reportId, items, onItemsChange }: RecursosStepProps) {
  const [internacionalDialogOpen, setInternacionalDialogOpen] = useState(false);
  const [nacionalDialogOpen, setNacionalDialogOpen] = useState(false);
  const [editingInternacional, setEditingInternacional] = useState<ConvocatoriaEntry | null>(null);
  const [editingNacional, setEditingNacional] = useState<ConvocatoriaEntry | null>(null);
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

  const handleSaveConvocatoria = async (entry: ConvocatoriaEntry, type: "internacional" | "nacional") => {
    if (!reportId) return;

    const indicatorName = type === "internacional" ? "Convocatorias Internacionales" : "Convocatorias Nacionales";
    const unitScore = type === "internacional" ? 10 : 5;
    const maxPoints = type === "internacional" ? 10 : 5;

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    const existingEntries: ConvocatoriaEntry[] = existingItem?.evidence_details || [];

    let updatedEntries: ConvocatoriaEntry[];
    if (entry.id) {
      updatedEntries = existingEntries.map((e) => (e.id === entry.id ? entry : e));
    } else {
      updatedEntries = [...existingEntries, { ...entry, id: crypto.randomUUID() }];
    }

    // Award MAX points if at least 1 entry exists
    const score = updatedEntries.length > 0 ? maxPoints : 0;

    const item: EvaluationItem = {
      report_id: reportId,
      category: "C",
      indicator_name: indicatorName,
      score_obtained: score,
      evidence_details: updatedEntries,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);

    toast.success("Convocatoria guardada");
    if (type === "internacional") {
      setEditingInternacional(null);
    } else {
      setEditingNacional(null);
    }
  };

  const handleDeleteConvocatoria = async (entryId: string, type: "internacional" | "nacional") => {
    if (!reportId) return;

    const indicatorName = type === "internacional" ? "Convocatorias Internacionales" : "Convocatorias Nacionales";
    const maxPoints = type === "internacional" ? 10 : 5;

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    const existingEntries: ConvocatoriaEntry[] = existingItem?.evidence_details || [];
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
          console.error("Delete convocatoria error:", error);
          toast.error("Error al eliminar", { description: error.message });
          return;
        }

        // Force immediate refetch
        await queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
        await queryClient.refetchQueries({ queryKey: ["evaluation-items"] });
        
        const updatedItems = items.filter((i) => i.id !== existingItem.id);
        onItemsChange(updatedItems);
      } else {
        const score = updatedEntries.length > 0 ? maxPoints : 0;

        const item: EvaluationItem = {
          report_id: reportId,
          category: "C",
          indicator_name: indicatorName,
          score_obtained: score,
          evidence_details: updatedEntries,
        };

        await saveItemMutation.mutateAsync(item);

        const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
        onItemsChange([...updatedItems, item]);
      }

      toast.success("Entrada eliminada");
    } catch (err: any) {
      console.error("Delete convocatoria error:", err);
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
    .filter((item) => item.category === "C")
    .reduce((sum, item) => sum + (item.score_obtained || 0), 0);

  const internacionalData = getItemData("Convocatorias Internacionales");
  const internacionalEntries: ConvocatoriaEntry[] = internacionalData.evidence_details || [];

  const nacionalData = getItemData("Convocatorias Nacionales");
  const nacionalEntries: ConvocatoriaEntry[] = nacionalData.evidence_details || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Recursos Económicos</h2>
        <p className="text-muted-foreground">Sección C - Máximo 15 puntos</p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-lg font-semibold text-primary">Puntos Sección C: {totalScore}/15</p>
      </div>

      <div className="space-y-4">
        {/* Convocatorias Internacionales */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Convocatorias Internacionales</span>
              <span className="text-primary text-sm">
                {internacionalData.score_obtained}/10 pts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setEditingInternacional(null);
                setInternacionalDialogOpen(true);
              }}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Convocatoria Internacional
            </Button>

            {internacionalEntries.length > 0 && (
              <div className="space-y-2">
                {internacionalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.entity_name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${entry.amount.toLocaleString()} USD | {entry.evidences.length} evidencia(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingInternacional(entry);
                          setInternacionalDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConvocatoria(entry.id!, "internacional")}
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

        {/* Convocatorias Nacionales */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Convocatorias Nacionales</span>
              <span className="text-primary text-sm">
                {nacionalData.score_obtained}/5 pts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setEditingNacional(null);
                setNacionalDialogOpen(true);
              }}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Convocatoria Nacional
            </Button>

            {nacionalEntries.length > 0 && (
              <div className="space-y-2">
                {nacionalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.entity_name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${entry.amount.toLocaleString()} USD | {entry.evidences.length} evidencia(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingNacional(entry);
                          setNacionalDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConvocatoria(entry.id!, "nacional")}
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

      <ConvocatoriaDialog
        open={internacionalDialogOpen}
        onOpenChange={setInternacionalDialogOpen}
        onSave={(entry) => handleSaveConvocatoria(entry, "internacional")}
        editingEntry={editingInternacional}
        reportId={reportId || ""}
        type="internacional"
      />

      <ConvocatoriaDialog
        open={nacionalDialogOpen}
        onOpenChange={setNacionalDialogOpen}
        onSave={(entry) => handleSaveConvocatoria(entry, "nacional")}
        editingEntry={editingNacional}
        reportId={reportId || ""}
        type="nacional"
      />
    </div>
  );
}
