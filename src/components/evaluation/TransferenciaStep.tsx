import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EvaluationItem {
  id?: string;
  report_id: string;
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_url?: string;
  quantity: number;
}

interface TransferenciaStepProps {
  reportId: string | null;
  items: EvaluationItem[];
  onItemsChange: (items: any[]) => void;
}

const INDICATORS = [
  { name: "Patentes", points: 5, unitScore: 5 },
  { name: "Proyectos de Vinculación", points: 5, unitScore: 2.5 },
];

export default function TransferenciaStep({ reportId, items, onItemsChange }: TransferenciaStepProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const saveItemMutation = useMutation({
    mutationFn: async (item: EvaluationItem) => {
      const existingItem = items.find((i) => i.indicator_name === item.indicator_name);

      if (existingItem?.id) {
        const { error } = await supabase
          .from("evaluation_items")
          .update({
            quantity: item.quantity,
            score_obtained: item.score_obtained,
            evidence_url: item.evidence_url,
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

  const handleQuantityChange = async (indicatorName: string, quantity: number, unitScore: number) => {
    if (!reportId) return;

    const score = Math.min(
      quantity * unitScore,
      INDICATORS.find((i) => i.name === indicatorName)?.points || 0
    );
    const existingItem = items.find((i) => i.indicator_name === indicatorName);

    const item: EvaluationItem = {
      report_id: reportId,
      category: "B",
      indicator_name: indicatorName,
      score_obtained: score,
      quantity: quantity,
      evidence_url: existingItem?.evidence_url || "",
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleFileUpload = async (indicatorName: string, file: File) => {
    if (!reportId) {
      toast.error("Error", { description: "No hay informe activo" });
      return;
    }

    if (!file.type.includes("pdf")) {
      toast.error("Error", { description: "Solo se permiten archivos PDF" });
      return;
    }

    setUploading(indicatorName);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const fileName = `${user.id}/${reportId}/${indicatorName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evaluation-evidence")
        .getPublicUrl(fileName);

      const existingItem = items.find((i) => i.indicator_name === indicatorName);

      const item: EvaluationItem = {
        report_id: reportId,
        category: "B",
        indicator_name: indicatorName,
        score_obtained: existingItem?.score_obtained || 0,
        quantity: existingItem?.quantity || 0,
        evidence_url: publicUrl,
      };

      await saveItemMutation.mutateAsync(item);

      const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
      onItemsChange([...updatedItems, item]);

      toast.success("Evidencia cargada", { description: "El archivo se ha subido correctamente" });
    } catch (error: any) {
      toast.error("Error al subir archivo", { description: error.message });
    } finally {
      setUploading(null);
    }
  };

  const getItemData = (indicatorName: string) => {
    return items.find((i) => i.indicator_name === indicatorName) || {
      quantity: 0,
      score_obtained: 0,
      evidence_url: "",
    };
  };

  const totalScore = items.reduce((sum, item) => sum + (item.score_obtained || 0), 0);

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
        {INDICATORS.map((indicator) => {
          const itemData = getItemData(indicator.name);

          return (
            <Card key={indicator.name} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{indicator.name}</span>
                  <span className="text-primary text-sm">
                    {itemData.score_obtained}/{indicator.points} pts
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${indicator.name}`}>Cantidad</Label>
                    <Input
                      id={`quantity-${indicator.name}`}
                      type="number"
                      min="0"
                      value={itemData.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          indicator.name,
                          parseInt(e.target.value) || 0,
                          indicator.unitScore
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {indicator.unitScore} punto{indicator.unitScore > 1 ? "s" : ""} por unidad
                    </p>
                  </div>

                  <div>
                    <Label>Evidencia (PDF)</Label>
                    {itemData.evidence_url ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(itemData.evidence_url, "_blank")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver evidencia
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={uploading === indicator.name}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".pdf";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileUpload(indicator.name, file);
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading === indicator.name ? "Subiendo..." : "Subir PDF"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
