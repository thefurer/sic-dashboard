import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  justification?: string;
  monto?: number;
  fase?: string;
  porcentaje_ejecucion?: number;
}

interface ImpactosStepProps {
  reportId: string | null;
  items: EvaluationItem[];
  onItemsChange: (items: any[]) => void;
}

const INDICATORS = [
  { name: "Patentes", points: 5, unitScore: 5, requiresExtraFields: true },
  { name: "Impacto Social", points: 10, requiresExtraFields: false },
  { name: "Impacto Ambiental", points: 10, requiresExtraFields: false },
  { name: "Impacto Económico", points: 5, requiresExtraFields: false },
];

export default function ImpactosStep({ reportId, items, onItemsChange }: ImpactosStepProps) {
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
            justification: item.justification,
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

  const handleQuantityChange = async (indicatorName: string, quantity: number, unitScore: number) => {
    if (!reportId) return;

    const indicator = INDICATORS.find((i) => i.name === indicatorName);
    // Award MAX points if at least 1 quantity exists
    const score = quantity > 0 ? (indicator?.points || 0) : 0;
    const existingItem = items.find((i) => i.indicator_name === indicatorName);

    const item: EvaluationItem = {
      report_id: reportId,
      category: "D",
      indicator_name: indicatorName,
      score_obtained: score,
      quantity: quantity,
      evidence_url: existingItem?.evidence_url || "",
      justification: existingItem?.justification || "",
      monto: existingItem?.monto || 0,
      fase: existingItem?.fase || "",
      porcentaje_ejecucion: existingItem?.porcentaje_ejecucion || 0,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleFieldChange = async (
    indicatorName: string,
    field: "monto" | "fase" | "porcentaje_ejecucion",
    value: number | string
  ) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    if (!existingItem) return;

    const item: EvaluationItem = {
      ...existingItem,
      [field]: value,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleJustificationChange = async (indicatorName: string, justification: string) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    const hasEvidence = existingItem?.evidence_url ? true : false;
    const hasJustification = justification.trim().length > 0;

    const indicator = INDICATORS.find((i) => i.name === indicatorName);
    // For non-patent indicators, award MAX points if both evidence and justification are provided
    const score = !indicator?.requiresExtraFields && hasEvidence && hasJustification 
      ? (indicator?.points || 0)
      : existingItem?.score_obtained || 0;

    const item: EvaluationItem = {
      report_id: reportId,
      category: "D",
      indicator_name: indicatorName,
      score_obtained: score,
      quantity: existingItem?.quantity || 0,
      justification: justification,
      evidence_url: existingItem?.evidence_url || "",
      monto: existingItem?.monto || 0,
      fase: existingItem?.fase || "",
      porcentaje_ejecucion: existingItem?.porcentaje_ejecucion || 0,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleFileUpload = async (indicatorName: string, file: File, index: number) => {
    if (!reportId) {
      toast.error("Error", { description: "No hay informe activo" });
      return;
    }

    if (!file.type.includes("pdf")) {
      toast.error("Error", { description: "Solo se permiten archivos PDF" });
      return;
    }

    setUploading(`${indicatorName}-${index}`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      // Sanitize filename: remove accents and special characters
      const sanitizedName = indicatorName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
      const fileName = `${user.id}/${reportId}/${sanitizedName}_${index + 1}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evaluation-evidence")
        .getPublicUrl(fileName);

      const existingItem = items.find((i) => i.indicator_name === indicatorName);
      const existingUrls = existingItem?.evidence_url
        ? JSON.parse(existingItem.evidence_url)
        : [];

      // Update the URL at the specific index
      const updatedUrls = [...existingUrls];
      updatedUrls[index] = publicUrl;

      const hasJustification = existingItem?.justification && existingItem.justification.trim().length > 0;
      const indicator = INDICATORS.find((i) => i.name === indicatorName);
      
      // For non-patent indicators, score is assigned if both evidence and justification are provided
      const score = !indicator?.requiresExtraFields && hasJustification 
        ? indicator?.points || 0 
        : existingItem?.score_obtained || 0;

      const item: EvaluationItem = {
        report_id: reportId,
        category: "D",
        indicator_name: indicatorName,
        score_obtained: score,
        quantity: existingItem?.quantity || 0,
        justification: existingItem?.justification || "",
        evidence_url: JSON.stringify(updatedUrls),
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
      justification: "",
      monto: 0,
      fase: "",
      porcentaje_ejecucion: 0,
    };
  };

  const totalScore = items.reduce((sum, item) => sum + (item.score_obtained || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Impactos y Patentes</h2>
        <p className="text-muted-foreground">
          Sección D - Máximo 25 puntos (Patentes requieren campos adicionales; Impactos requieren evidencia + justificación)
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-lg font-semibold text-primary">Puntos Sección D: {totalScore}/25</p>
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
                {indicator.requiresExtraFields ? (
                  <>
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
                              indicator.unitScore || 0
                            )
                          }
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {indicator.unitScore} punto{indicator.unitScore && indicator.unitScore > 1 ? "s" : ""} por unidad
                        </p>
                      </div>

                      <div>
                        <Label htmlFor={`monto-${indicator.name}`}>Monto (USD)</Label>
                        <Input
                          id={`monto-${indicator.name}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={itemData.monto || 0}
                          onChange={(e) =>
                            handleFieldChange(indicator.name, "monto", parseFloat(e.target.value) || 0)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`fase-${indicator.name}`}>Fase</Label>
                        <Select
                          value={itemData.fase || ""}
                          onValueChange={(value) => handleFieldChange(indicator.name, "fase", value)}
                        >
                          <SelectTrigger id={`fase-${indicator.name}`} className="mt-1">
                            <SelectValue placeholder="Seleccione fase" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primera">Primera</SelectItem>
                            <SelectItem value="segunda">Segunda</SelectItem>
                            <SelectItem value="tercera">Tercera</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`ejecucion-${indicator.name}`}>% Ejecución</Label>
                        <Input
                          id={`ejecucion-${indicator.name}`}
                          type="number"
                          min="0"
                          max="100"
                          value={itemData.porcentaje_ejecucion || 0}
                          onChange={(e) =>
                            handleFieldChange(
                              indicator.name,
                              "porcentaje_ejecucion",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Evidencias (PDF)</Label>
                      <div className="space-y-2 mt-1">
                        {Array.from({ length: itemData.quantity || 0 }).map((_, idx) => {
                          const evidenceUrls = itemData.evidence_url
                            ? JSON.parse(itemData.evidence_url)
                            : [];
                          const url = evidenceUrls[idx];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground min-w-[80px]">
                                Evidencia {idx + 1}:
                              </span>
                              {url ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(url, "_blank")}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Ver PDF
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  disabled={uploading === `${indicator.name}-${idx}`}
                                  onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = ".pdf";
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) handleFileUpload(indicator.name, file, idx);
                                    };
                                    input.click();
                                  }}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploading === `${indicator.name}-${idx}` ? "Subiendo..." : "Subir PDF"}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        {(itemData.quantity || 0) === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Ingrese una cantidad para habilitar la carga de evidencias
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor={`justification-${indicator.name}`}>
                        Justificación (requerida)
                      </Label>
                      <Textarea
                        id={`justification-${indicator.name}`}
                        value={itemData.justification}
                        onChange={(e) => handleJustificationChange(indicator.name, e.target.value)}
                        placeholder="Describa el impacto generado, incluyendo evidencia cualitativa y cuantitativa..."
                        className="mt-1 min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo 100 caracteres para recibir puntuación
                      </p>
                    </div>

                    <div>
                      <Label>Evidencia (PDF requerido)</Label>
                      <div className="space-y-2 mt-1">
                        {Array.from({ length: 1 }).map((_, idx) => {
                          const evidenceUrls = itemData.evidence_url
                            ? JSON.parse(itemData.evidence_url)
                            : [];
                          const url = evidenceUrls[idx];
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              {url ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(url, "_blank")}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Ver evidencia
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  disabled={uploading === `${indicator.name}-${idx}`}
                                  onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = ".pdf";
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) handleFileUpload(indicator.name, file, idx);
                                    };
                                    input.click();
                                  }}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploading === `${indicator.name}-${idx}` ? "Subiendo..." : "Subir PDF"}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
