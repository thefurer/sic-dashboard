import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectSelector from "./ProjectSelector";
import { MultiSelect } from "@/components/ui/multi-select";
import EntryFormDialog, { type EntryData, type IndicatorType } from "./EntryFormDialog";

interface EvaluationItem {
  id?: string;
  report_id: string;
  category: string;
  indicator_name: string;
  score_obtained: number;
  related_project_id?: string;
  proposal_type?: string;
  team_members?: string[];
  project_roles?: { director?: string; principal?: string };
  entries?: EntryData[];
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIndicator, setCurrentIndicator] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ indicator: string; entryId: string } | null>(null);
  const queryClient = useQueryClient();

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
        score_obtained: item.score_obtained,
        related_project_id: item.related_project_id,
        evidence_details: item.entries || [],
        quantity: (item.entries || []).length,
      };

      if (item.proposal_type) payload.proposal_type = item.proposal_type;
      if (item.team_members) payload.team_members = item.team_members;
      if (item.project_roles) payload.project_roles = item.project_roles;

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
            category: "A",
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
      score_obtained: existingItem?.score_obtained || 0,
      related_project_id: existingItem?.related_project_id,
      proposal_type: existingItem?.proposal_type,
      team_members: existingItem?.team_members,
      project_roles: existingItem?.project_roles,
      entries: existingItem?.entries || [],
      ...updates,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== indicatorName);
    onItemsChange([...updatedItems, item]);
  };

  const handleAddEntry = (indicatorName: string) => {
    setCurrentIndicator(indicatorName);
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleEditEntry = (indicatorName: string, entryId: string) => {
    setCurrentIndicator(indicatorName);
    setEditingEntry({ indicator: indicatorName, entryId });
    setDialogOpen(true);
  };

  const handleSaveEntry = async (entryData: EntryData) => {
    if (!reportId || !currentIndicator) return;

    const existingItem = items.find((i) => i.indicator_name === currentIndicator);
    const currentEntries = existingItem?.entries || [];

    let updatedEntries: EntryData[];
    if (editingEntry) {
      updatedEntries = currentEntries.map(e => 
        e.id === editingEntry.entryId ? { ...entryData, id: e.id } : e
      );
    } else {
      updatedEntries = [...currentEntries, { ...entryData, id: crypto.randomUUID() }];
    }

    const indicator = INDICATORS.find(i => i.name === currentIndicator);
    const newScore = Math.min(
      updatedEntries.length * (indicator?.unitScore || 1),
      indicator?.points || 0
    );

    await handleFieldUpdate(currentIndicator, {
      entries: updatedEntries,
      score_obtained: newScore,
    });

    setDialogOpen(false);
    setCurrentIndicator(null);
    setEditingEntry(null);
    toast.success("Entrada guardada correctamente");
  };

  const handleDeleteEntry = async (indicatorName: string, entryId: string) => {
    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    const updatedEntries = (existingItem?.entries || []).filter(e => e.id !== entryId);

    const indicator = INDICATORS.find(i => i.name === indicatorName);
    const newScore = Math.min(
      updatedEntries.length * (indicator?.unitScore || 1),
      indicator?.points || 0
    );

    await handleFieldUpdate(indicatorName, {
      entries: updatedEntries,
      score_obtained: newScore,
    });

    toast.success("Entrada eliminada");
  };

  const getItemData = (indicatorName: string) => {
    return items.find((i) => i.indicator_name === indicatorName) || {
      score_obtained: 0,
      entries: [],
      related_project_id: "",
      proposal_type: "",
      team_members: [],
      project_roles: { director: "", principal: "" },
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
          const isRepeatable = !isProject;
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

                {/* Repeater Form for Non-Projects */}
                {isRepeatable && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Entradas Registradas</Label>
                      <Button
                        onClick={() => handleAddEntry(indicator.name)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar {indicator.name}
                      </Button>
                    </div>

                    {(itemData.entries || []).length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          No hay entradas registradas. Click en "Agregar" para comenzar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(itemData.entries || []).map((entry, index) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {entry.metadata?.title || `Entrada ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Tipo: {entry.project_type}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEntry(indicator.name, entry.id!)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(indicator.name, entry.id!)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                       </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Total: {(itemData.entries || []).length} entrada(s) × {indicator.unitScore} punto(s) = {itemData.score_obtained} puntos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Entry Form Dialog */}
      {currentIndicator && (
        <EntryFormDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setCurrentIndicator(null);
            setEditingEntry(null);
          }}
          onSave={handleSaveEntry}
          indicatorType={currentIndicator as IndicatorType}
          reportId={reportId!}
          existingEntry={
            editingEntry
              ? items
                  .find((i) => i.indicator_name === editingEntry.indicator)
                  ?.entries?.find((e) => e.id === editingEntry.entryId)
              : undefined
          }
        />
      )}
    </div>
  );
}
