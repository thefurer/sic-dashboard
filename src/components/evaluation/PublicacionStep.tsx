import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDOIMetadata } from "@/hooks/useDOIMetadata";
import { useISBNMetadata } from "@/hooks/useISBNMetadata";

interface EvaluationItem {
  id?: string;
  report_id: string;
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_url?: string;
  quantity: number;
  evidence_urls?: string[]; // Multiple evidence URLs
}

interface Evidence {
  url: string;
  index: number;
}

interface PublicacionStepProps {
  reportId: string | null;
  items: EvaluationItem[];
  onItemsChange: (items: any[]) => void;
}

const INDICATORS = [
  { name: "Proyectos I+D+i", points: 15, unitScore: 3 },
  { name: "Artículos JCR/Scopus", points: 10, unitScore: 2 },
  { name: "Libros Científicos", points: 10, unitScore: 2 },
  { name: "Artículos Regionales", points: 5, unitScore: 1 },
  { name: "Ponencias", points: 5, unitScore: 1 },
];

export default function PublicacionStep({ reportId, items, onItemsChange }: PublicacionStepProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [doiSearch, setDoiSearch] = useState<Record<string, string>>({});
  const [isbnSearch, setIsbnSearch] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { fetchMetadata: fetchDOI, isLoading: loadingDOI } = useDOIMetadata();
  const { fetchMetadata: fetchISBN, isLoading: loadingISBN } = useISBNMetadata();

  const saveItemMutation = useMutation({
    mutationFn: async (item: EvaluationItem) => {
      const existingItem = items.find((i) => i.indicator_name === item.indicator_name);

      // Store evidence_urls as JSON in evidence_url field
      const evidenceUrlToStore = item.evidence_urls && item.evidence_urls.length > 0 
        ? JSON.stringify(item.evidence_urls) 
        : item.evidence_url || "";

      if (existingItem?.id) {
        const { error } = await supabase
          .from("evaluation_items")
          .update({
            quantity: item.quantity,
            score_obtained: item.score_obtained,
            evidence_url: evidenceUrlToStore,
          })
          .eq("id", existingItem.id);

        if (error) throw error;
        return { ...existingItem, ...item };
      } else {
        const { data, error } = await supabase
          .from("evaluation_items")
          .insert({
            ...item,
            evidence_url: evidenceUrlToStore,
          })
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

    const score = Math.min(quantity * unitScore, INDICATORS.find((i) => i.name === indicatorName)?.points || 0);
    const existingItem = items.find((i) => i.indicator_name === indicatorName);

    const item: EvaluationItem = {
      report_id: reportId,
      category: "A",
      indicator_name: indicatorName,
      score_obtained: score,
      quantity: quantity,
      evidence_url: existingItem?.evidence_url || "",
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleFileUpload = async (indicatorName: string, file: File, evidenceIndex: number) => {
    if (!reportId) {
      toast.error("Error", { description: "No hay informe activo" });
      return;
    }

    if (!file.type.includes("pdf")) {
      toast.error("Error", { description: "Solo se permiten archivos PDF" });
      return;
    }

    setUploading(`${indicatorName}-${evidenceIndex}`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      const fileName = `${user.id}/${reportId}/${indicatorName.replace(/\s+/g, "_")}_${evidenceIndex}_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evaluation-evidence")
        .getPublicUrl(fileName);

      const existingItem = items.find((i) => i.indicator_name === indicatorName);
      const currentUrls = existingItem?.evidence_urls || [];
      const newUrls = [...currentUrls];
      newUrls[evidenceIndex] = publicUrl;
      
      const item: EvaluationItem = {
        report_id: reportId,
        category: "A",
        indicator_name: indicatorName,
        score_obtained: existingItem?.score_obtained || 0,
        quantity: existingItem?.quantity || 0,
        evidence_url: newUrls[0] || "", // Keep first URL in evidence_url for compatibility
        evidence_urls: newUrls,
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

  const handleSearchMetadata = async (indicatorName: string) => {
    const isArticle = indicatorName.includes("Artículos");
    const isBook = indicatorName.includes("Libros");
    
    if (isArticle) {
      const doi = doiSearch[indicatorName];
      if (!doi) {
        toast.error("Error", { description: "Ingrese un DOI" });
        return;
      }
      const metadata = await fetchDOI(doi);
      if (metadata) {
        toast.success("Metadata encontrada", { 
          description: `${metadata.title} - ${metadata.authors}` 
        });
      }
    } else if (isBook) {
      const isbn = isbnSearch[indicatorName];
      if (!isbn) {
        toast.error("Error", { description: "Ingrese un ISBN" });
        return;
      }
      const metadata = await fetchISBN(isbn);
      if (metadata) {
        toast.success("Metadata encontrada", { 
          description: `${metadata.title} - ${metadata.authors}` 
        });
      }
    }
  };

  const getItemData = (indicatorName: string) => {
    const item = items.find((i) => i.indicator_name === indicatorName);
    if (item) {
      // Parse evidence_urls if stored as JSON string
      if (item.evidence_url && item.evidence_url.startsWith('[')) {
        try {
          item.evidence_urls = JSON.parse(item.evidence_url);
        } catch {
          item.evidence_urls = [item.evidence_url];
        }
      } else if (item.evidence_url) {
        item.evidence_urls = [item.evidence_url];
      }
      return item;
    }
    return { quantity: 0, score_obtained: 0, evidence_url: "", evidence_urls: [] };
  };

  const totalScore = items.reduce((sum, item) => sum + (item.score_obtained || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Publicación y Difusión Científica
        </h2>
        <p className="text-muted-foreground">
          Sección A - Máximo 45 puntos
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-lg font-semibold text-primary">
          Puntos Sección A: {totalScore}/45
        </p>
      </div>

      <div className="space-y-4">
        {INDICATORS.map((indicator) => {
          const itemData = getItemData(indicator.name);
          const evidenceUrls = itemData.evidence_urls || (itemData.evidence_url ? [itemData.evidence_url] : []);
          const isArticle = indicator.name.includes("Artículos");
          const isBook = indicator.name.includes("Libros");
          
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
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${indicator.name}`}>Cantidad *</Label>
                    <Input
                      id={`quantity-${indicator.name}`}
                      type="number"
                      min="0"
                      required
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

                  {/* DOI/ISBN Search for Articles and Books */}
                  {(isArticle || isBook) && (
                    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                      <Label className="text-sm font-medium mb-2 block">
                        Búsqueda Inteligente {isArticle ? "DOI" : "ISBN"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={isArticle ? "10.1234/example.2024" : "978-84-1234-567-8"}
                          value={isArticle ? (doiSearch[indicator.name] || "") : (isbnSearch[indicator.name] || "")}
                          onChange={(e) => {
                            if (isArticle) {
                              setDoiSearch({ ...doiSearch, [indicator.name]: e.target.value });
                            } else {
                              setIsbnSearch({ ...isbnSearch, [indicator.name]: e.target.value });
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => handleSearchMetadata(indicator.name)}
                          disabled={loadingDOI || loadingISBN}
                          size="sm"
                        >
                          {(loadingDOI || loadingISBN) ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                      {isArticle && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 p-0 h-auto text-xs"
                          onClick={() => window.open("https://miar.ub.edu/idioma/es", "_blank")}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Verificar en MIAR
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Dynamic Evidence Upload Fields */}
                  <div>
                    <Label className="mb-2 block">Evidencias (PDF) *</Label>
                    <div className="space-y-2">
                      {Array.from({ length: Math.max(itemData.quantity, 1) }).map((_, index) => {
                        const hasEvidence = evidenceUrls[index];
                        const isUploading = uploading === `${indicator.name}-${index}`;
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-8">
                              {index + 1}.
                            </span>
                            {hasEvidence ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(evidenceUrls[index], "_blank")}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Ver evidencia {index + 1}
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
                                      if (file) handleFileUpload(indicator.name, file, index);
                                    };
                                    input.click();
                                  }}
                                >
                                  Cambiar
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled={isUploading}
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = ".pdf";
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleFileUpload(indicator.name, file, index);
                                  };
                                  input.click();
                                }}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploading ? "Subiendo..." : `Subir evidencia ${index + 1}`}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Se requiere evidencia para cada ítem declarado
                    </p>
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
