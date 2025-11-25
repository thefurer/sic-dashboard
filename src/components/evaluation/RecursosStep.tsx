import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  monto?: number;
  fase?: string;
  porcentaje_ejecucion?: number;
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

const FASES = ["Propuesta", "Ejecución", "Finalizado"];

export default function RecursosStep({ reportId, items, onItemsChange }: RecursosStepProps) {
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
            monto: item.monto,
            fase: item.fase,
            porcentaje_ejecucion: item.porcentaje_ejecucion,
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

  const handleFieldChange = async (
    indicatorName: string,
    field: string,
    value: any,
    unitScore: number
  ) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    
    const updatedItem: EvaluationItem = {
      report_id: reportId,
      category: "C",
      indicator_name: indicatorName,
      quantity: field === "quantity" ? value : (existingItem?.quantity || 0),
      score_obtained: field === "quantity" 
        ? Math.min(value * unitScore, INDICATORS.find((i) => i.name === indicatorName)?.points || 0)
        : (existingItem?.score_obtained || 0),
      evidence_url: existingItem?.evidence_url || "",
      monto: field === "monto" ? value : (existingItem?.monto || 0),
      fase: field === "fase" ? value : (existingItem?.fase || ""),
      porcentaje_ejecucion: field === "porcentaje_ejecucion" ? value : (existingItem?.porcentaje_ejecucion || 0),
    };

    await saveItemMutation.mutateAsync(updatedItem);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, updatedItem]);
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
        category: "C",
        indicator_name: indicatorName,
        score_obtained: existingItem?.score_obtained || 0,
        quantity: existingItem?.quantity || 0,
        evidence_url: publicUrl,
        monto: existingItem?.monto || 0,
        fase: existingItem?.fase || "",
        porcentaje_ejecucion: existingItem?.porcentaje_ejecucion || 0,
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
      monto: 0,
      fase: "",
      porcentaje_ejecucion: 0,
    };
  };

  const totalScore = items.reduce((sum, item) => sum + (item.score_obtained || 0), 0);

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
                    <Label htmlFor={`quantity-${indicator.name}`}>Cantidad *</Label>
                    <Input
                      id={`quantity-${indicator.name}`}
                      type="number"
                      min="0"
                      required
                      value={itemData.quantity}
                      onChange={(e) =>
                        handleFieldChange(
                          indicator.name,
                          "quantity",
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
                    <Label htmlFor={`monto-${indicator.name}`}>Monto (USD) *</Label>
                    <Input
                      id={`monto-${indicator.name}`}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={itemData.monto || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          indicator.name,
                          "monto",
                          parseFloat(e.target.value) || 0,
                          indicator.unitScore
                        )
                      }
                      className="mt-1"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`fase-${indicator.name}`}>Fase *</Label>
                    <Select
                      value={itemData.fase || ""}
                      onValueChange={(value) =>
                        handleFieldChange(indicator.name, "fase", value, indicator.unitScore)
                      }
                    >
                      <SelectTrigger id={`fase-${indicator.name}`} className="mt-1">
                        <SelectValue placeholder="Seleccione fase" />
                      </SelectTrigger>
                      <SelectContent>
                        {FASES.map((fase) => (
                          <SelectItem key={fase} value={fase}>
                            {fase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`porcentaje-${indicator.name}`}>
                      % Ejecución *
                    </Label>
                    <Input
                      id={`porcentaje-${indicator.name}`}
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={itemData.porcentaje_ejecucion || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          indicator.name,
                          "porcentaje_ejecucion",
                          parseInt(e.target.value) || 0,
                          indicator.unitScore
                        )
                      }
                      className="mt-1"
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ingrese valor entre 0 y 100
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Evidencia (PDF) *</Label>
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
                      <Button
                        variant="ghost"
                        size="sm"
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
                        Cambiar
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}