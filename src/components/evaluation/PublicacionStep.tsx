import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDOIMetadata } from "@/hooks/useDOIMetadata";
import { useISBNMetadata } from "@/hooks/useISBNMetadata";
import EvidenceUploader, { Evidence } from "./EvidenceUploader";
import ProjectSelector from "./ProjectSelector";
import { MultiSelect } from "@/components/ui/multi-select";

interface EvaluationItem {
  id?: string;
  report_id: string;
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_url?: string;
  quantity: number;
  related_project_id?: string;
  proposal_type?: string;
  team_members?: string[];
  project_roles?: { director?: string; principal?: string };
  article_metadata?: { quartile?: string; issn?: string; repo?: string };
  evidence_details?: Evidence[];
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
  const [articleMetadata, setArticleMetadata] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  const { fetchMetadata: fetchDOI, isLoading: loadingDOI } = useDOIMetadata();
  const { fetchMetadata: fetchISBN, isLoading: loadingISBN } = useISBNMetadata();

  // Fetch all profiles for team selection
  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: async (item: EvaluationItem) => {
      const existingItem = items.find((i) => i.indicator_name === item.indicator_name);

      const payload: any = {
        quantity: item.quantity,
        score_obtained: item.score_obtained,
        related_project_id: item.related_project_id,
        evidence_details: item.evidence_details || [],
      };

      // Include specific metadata based on indicator type
      if (item.proposal_type) payload.proposal_type = item.proposal_type;
      if (item.team_members) payload.team_members = item.team_members;
      if (item.project_roles) payload.project_roles = item.project_roles;
      if (item.article_metadata) payload.article_metadata = item.article_metadata;

      if (existingItem?.id) {
        const { error } = await supabase
          .from("evaluation_items")
          .update(payload)
          .eq("id", existingItem.id);

        if (error) throw error;
        return { ...existingItem, ...item };
      } else {
        const { data, error } = await supabase
          .from("evaluation_items")
          .insert({
            report_id: item.report_id,
            category: item.category,
            indicator_name: item.indicator_name,
            ...payload,
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

  const handleFieldUpdate = async (indicatorName: string, updates: Partial<EvaluationItem>) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    
    const item: EvaluationItem = {
      report_id: reportId,
      category: "A",
      indicator_name: indicatorName,
      quantity: existingItem?.quantity || 0,
      score_obtained: existingItem?.score_obtained || 0,
      related_project_id: existingItem?.related_project_id,
      proposal_type: existingItem?.proposal_type,
      team_members: existingItem?.team_members,
      project_roles: existingItem?.project_roles,
      article_metadata: existingItem?.article_metadata,
      evidence_details: existingItem?.evidence_details || [],
      ...updates,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleQuantityChange = async (indicatorName: string, quantity: number, unitScore: number) => {
    const score = Math.min(quantity * unitScore, INDICATORS.find((i) => i.name === indicatorName)?.points || 0);
    await handleFieldUpdate(indicatorName, { quantity, score_obtained: score });
  };

  // Sanitize filename to prevent storage errors
  const sanitizeFilename = (filename: string): string => {
    // Remove accents and special characters, convert to lowercase
    return filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9._-]/gi, "_") // Replace non-alphanumeric with underscore
      .toLowerCase();
  };

  const handleEvidenceUpload = async (indicatorName: string, file: File, description: string) => {
    if (!reportId) {
      toast.error("Error", { description: "No hay informe activo" });
      return;
    }

    setUploading(indicatorName);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated");

      // Extract file extension
      const fileExtension = file.name.split(".").pop() || "pdf";
      
      // Sanitize indicator name and create unique filename
      const sanitizedIndicator = sanitizeFilename(indicatorName);
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const sanitizedOriginalName = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ""));
      
      const fileName = `${user.id}/${reportId}/${sanitizedIndicator}_${uniqueId}_${sanitizedOriginalName}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from("evaluation-evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("evaluation-evidence")
        .getPublicUrl(fileName);

      const existingItem = items.find((i) => i.indicator_name === indicatorName);
      const currentEvidences = existingItem?.evidence_details || [];
      const newEvidences = [...currentEvidences, { url: publicUrl, description }];

      await handleFieldUpdate(indicatorName, { evidence_details: newEvidences });

      toast.success("Evidencia cargada correctamente");
    } catch (error: any) {
      toast.error("Error al subir archivo", { description: error.message });
    } finally {
      setUploading(null);
    }
  };

  const handleEvidenceDelete = async (indicatorName: string, index: number) => {
    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    const currentEvidences = existingItem?.evidence_details || [];
    const newEvidences = currentEvidences.filter((_, i) => i !== index);
    await handleFieldUpdate(indicatorName, { evidence_details: newEvidences });
  };

  const handleEvidenceDescriptionChange = async (indicatorName: string, index: number, description: string) => {
    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    const currentEvidences = existingItem?.evidence_details || [];
    const newEvidences = [...currentEvidences];
    newEvidences[index] = { ...newEvidences[index], description };
    await handleFieldUpdate(indicatorName, { evidence_details: newEvidences });
  };

  const handleSearchDOI = async (indicatorName: string) => {
    const doi = doiSearch[indicatorName];
    if (!doi) {
      toast.error("Error", { description: "Ingrese un DOI" });
      return;
    }
    
    const metadata = await fetchDOI(doi);
    if (metadata) {
      // Store metadata for display
      setArticleMetadata({
        ...articleMetadata,
        [indicatorName]: {
          title: metadata.title,
          authors: metadata.authors,
          journal: metadata.journal,
          issn: metadata.issn,
          publisher: metadata.publisher,
          url: metadata.url,
        },
      });
      
      // Auto-detect repository based on metadata heuristics
      let autoRepo = "";
      const publisher = metadata.publisher?.toLowerCase() || "";
      const url = metadata.url?.toLowerCase() || "";
      const doiLower = doi.toLowerCase();
      
      if (publisher.includes("elsevier") || url.includes("scopus")) {
        autoRepo = "Scopus";
      } else if (publisher.includes("clarivate") || publisher.includes("wos") || url.includes("webofscience")) {
        autoRepo = "ISI Web of Knowledge (WOS)";
      } else if (url.includes("scielo") || doiLower.includes("scielo")) {
        autoRepo = "Scielo";
      } else if (url.includes("redalyc") || doiLower.includes("redalyc")) {
        autoRepo = "Redalyc";
      } else if (url.includes("ebsco")) {
        autoRepo = "Ebsco";
      } else if (metadata.issn) {
        // If we have an ISSN but no specific match, default to "Otras contempladas por el CACES"
        autoRepo = "Otras contempladas por el CACES";
      }
      
      // Auto-populate article metadata fields
      const autoQuartile = "Verificar en Web";
      
      await handleFieldUpdate(indicatorName, {
        article_metadata: {
          issn: metadata.issn || "",
          quartile: autoQuartile,
          repo: autoRepo,
        }
      });
      
      toast.success("Metadata obtenida y campos actualizados", { 
        description: `${metadata.title} - ${metadata.journal}` 
      });
    }
  };

  const handleSearchISBN = async (indicatorName: string) => {
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
  };

  const getItemData = (indicatorName: string) => {
    return items.find((i) => i.indicator_name === indicatorName) || {
      quantity: 0,
      score_obtained: 0,
      evidence_details: [],
      related_project_id: "",
      proposal_type: "",
      team_members: [],
      project_roles: { director: "", principal: "" },
      article_metadata: { quartile: "", issn: "", repo: "" },
    };
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
          const isProject = indicator.name === "Proyectos I+D+i";
          const isArticle = indicator.name.includes("Artículos JCR/Scopus");
          const isBook = indicator.name.includes("Libros");
          const profileOptions = profiles?.map(p => ({ value: p.id, label: p.full_name })) || [];
          
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
              <CardContent className="space-y-6">
                {/* Related Project - Universal */}
                <ProjectSelector
                  value={itemData.related_project_id}
                  onChange={(value) => handleFieldUpdate(indicator.name, { related_project_id: value })}
                  required
                />

                {/* Project-Specific Fields */}
                {isProject && (
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <h4 className="font-semibold text-sm">Detalles del Proyecto</h4>
                    
                    <div>
                      <Label>Tipo de Propuesta *</Label>
                      <Select
                        value={itemData.proposal_type}
                        onValueChange={(value) => handleFieldUpdate(indicator.name, { proposal_type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Investigación Científica">Investigación Científica</SelectItem>
                          <SelectItem value="Desarrollo Tecnológico">Desarrollo Tecnológico</SelectItem>
                          <SelectItem value="Innovación">Innovación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Equipo Investigador *</Label>
                      <MultiSelect
                        options={profileOptions}
                        selected={itemData.team_members || []}
                        onChange={(values) => handleFieldUpdate(indicator.name, { team_members: values })}
                        placeholder="Seleccione miembros del equipo"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Director del Proyecto *</Label>
                        <Select
                          value={itemData.project_roles?.director}
                          onValueChange={(value) => 
                            handleFieldUpdate(indicator.name, {
                              project_roles: { ...itemData.project_roles, director: value }
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles?.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Investigador Principal *</Label>
                        <Select
                          value={itemData.project_roles?.principal}
                          onValueChange={(value) => 
                            handleFieldUpdate(indicator.name, {
                              project_roles: { ...itemData.project_roles, principal: value }
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles?.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Article-Specific Fields */}
                {isArticle && (
                  <div className="space-y-4">
                    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                      <Label className="text-sm font-medium mb-2 block">
                        Búsqueda Inteligente DOI
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="10.1234/example.2024"
                          value={doiSearch[indicator.name] || ""}
                          onChange={(e) => setDoiSearch({ ...doiSearch, [indicator.name]: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => handleSearchDOI(indicator.name)}
                          disabled={loadingDOI}
                          size="sm"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {loadingDOI ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                      {articleMetadata[indicator.name] && (
                        <div className="mt-3 p-3 bg-background rounded text-xs space-y-1">
                          <p><strong>Título:</strong> {articleMetadata[indicator.name].title}</p>
                          <p><strong>Autores:</strong> {articleMetadata[indicator.name].authors}</p>
                          <p><strong>Revista:</strong> {articleMetadata[indicator.name].journal}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cuartil Scimago (Auto-detectado)</Label>
                        <Input
                          value={itemData.article_metadata?.quartile || ""}
                          readOnly
                          className="mt-1 bg-muted/50 cursor-not-allowed"
                          placeholder="Buscar DOI primero"
                        />
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 p-0 h-auto text-xs"
                          onClick={() => {
                            const issn = articleMetadata[indicator.name]?.issn || itemData.article_metadata?.issn;
                            if (!issn) {
                              toast.error("ISSN no disponible", { description: "Realice la búsqueda DOI primero" });
                              return;
                            }
                            window.open(`https://www.scimagojr.com/journalsearch.php?q=${issn}`, "_blank");
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Verificar en Scimago
                        </Button>
                      </div>

                      <div>
                        <Label>Indizado en / Base de Datos *</Label>
                        <Select
                          value={itemData.article_metadata?.repo || ""}
                          onValueChange={(value) => 
                            handleFieldUpdate(indicator.name, {
                              article_metadata: { 
                                ...itemData.article_metadata, 
                                repo: value 
                              }
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccione o busque DOI primero" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Scopus">Scopus</SelectItem>
                            <SelectItem value="ISI Web of Knowledge (WOS)">ISI Web of Knowledge (WOS)</SelectItem>
                            <SelectItem value="Latindex (Catálogo)">Latindex (Catálogo)</SelectItem>
                            <SelectItem value="Scielo">Scielo</SelectItem>
                            <SelectItem value="Lilacs">Lilacs</SelectItem>
                            <SelectItem value="Redalyc">Redalyc</SelectItem>
                            <SelectItem value="Ebsco">Ebsco</SelectItem>
                            <SelectItem value="OAJI">OAJI</SelectItem>
                            <SelectItem value="Otras contempladas por el CACES">Otras contempladas por el CACES</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ISBN Search for Books */}
                {isBook && (
                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <Label className="text-sm font-medium mb-2 block">
                      Búsqueda Inteligente ISBN
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="978-84-1234-567-8"
                        value={isbnSearch[indicator.name] || ""}
                        onChange={(e) => setIsbnSearch({ ...isbnSearch, [indicator.name]: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => handleSearchISBN(indicator.name)}
                        disabled={loadingISBN}
                        size="sm"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {loadingISBN ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>
                )}

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

                <EvidenceUploader
                  evidences={itemData.evidence_details || []}
                  onUpload={(file, description) => handleEvidenceUpload(indicator.name, file, description)}
                  onDelete={(index) => handleEvidenceDelete(indicator.name, index)}
                  onDescriptionChange={(index, description) => 
                    handleEvidenceDescriptionChange(indicator.name, index, description)
                  }
                  uploading={uploading === indicator.name}
                  maxFiles={itemData.quantity || 1}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
