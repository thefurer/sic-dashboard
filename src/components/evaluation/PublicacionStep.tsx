import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EntryFormDialog, { type EntryData, type IndicatorType } from "./EntryFormDialog";
import ProjectEntryDialog, { type ProjectEntryData } from "./ProjectEntryDialog";

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
  project_entries?: ProjectEntryData[];
}

interface PublicacionStepProps {
  reportId: string | null;
  items: EvaluationItem[];
  onItemsChange: (items: any[]) => void;
  isReadOnly?: boolean;
}

const INDICATORS = [
  { name: "Proyectos I+D+i", points: 15, unitScore: 3 },
  { name: "Artículos JCR/Scopus", points: 10, unitScore: 2 },
  { name: "Libros Científicos", points: 10, unitScore: 2 },
  { name: "Artículos Regionales", points: 5, unitScore: 1 },
  { name: "Ponencias", points: 5, unitScore: 1 },
];

export default function PublicacionStep({ reportId, items, onItemsChange, isReadOnly = false }: PublicacionStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [currentIndicator, setCurrentIndicator] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ indicator: string; entryId: string } | null>(null);
  const [editingProjectEntry, setEditingProjectEntry] = useState<string | null>(null);
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
      const isProject = item.indicator_name === "Proyectos I+D+i";

      const payload: any = {
        score_obtained: item.score_obtained,
        related_project_id: item.related_project_id,
        evidence_details: isProject ? (item.project_entries || []) : (item.entries || []),
        quantity: isProject ? (item.project_entries || []).length : (item.entries || []).length,
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
    // Award MAX points if at least 1 entry exists
    const newScore = updatedEntries.length > 0 ? (indicator?.points || 0) : 0;

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
    const newScore = updatedEntries.length > 0 ? (indicator?.points || 0) : 0;

    try {
      if (updatedEntries.length === 0 && existingItem?.id) {
        // Delete the entire evaluation_item row if no entries remain
        const { error } = await supabase
          .from("evaluation_items")
          .delete()
          .eq("id", existingItem.id)
          .eq("report_id", reportId!);

        if (error) {
          console.error("Delete entry error:", error);
          toast.error("Error al eliminar", { description: error.message });
          return;
        }

        // Force immediate refetch
        await queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
        await queryClient.refetchQueries({ queryKey: ["evaluation-items"] });
        
        const updatedItems = items.filter((i) => i.id !== existingItem.id);
        onItemsChange(updatedItems);
      } else {
        await handleFieldUpdate(indicatorName, {
          entries: updatedEntries,
          score_obtained: newScore,
        });
      }

      toast.success("Entrada eliminada");
    } catch (err: any) {
      console.error("Delete entry error:", err);
      toast.error("Error al eliminar", { description: err.message });
    }
  };

  // Project Entry Handlers
  const handleAddProjectEntry = () => {
    setProjectDialogOpen(true);
    setEditingProjectEntry(null);
  };

  const handleEditProjectEntry = (entryId: string) => {
    setEditingProjectEntry(entryId);
    setProjectDialogOpen(true);
  };

  const handleDeleteProjectEntry = async (entryId: string) => {
    const existingItem = items.find((i) => i.indicator_name === "Proyectos I+D+i");
    const updatedEntries = (existingItem?.project_entries || []).filter(e => e.id !== entryId);

    const indicator = INDICATORS.find(i => i.name === "Proyectos I+D+i");
    const newScore = updatedEntries.length > 0 ? (indicator?.points || 0) : 0;

    try {
      if (updatedEntries.length === 0 && existingItem?.id) {
        // Delete the entire evaluation_item row if no entries remain
        const { error } = await supabase
          .from("evaluation_items")
          .delete()
          .eq("id", existingItem.id)
          .eq("report_id", reportId!);

        if (error) {
          console.error("Delete project entry error:", error);
          toast.error("Error al eliminar", { description: error.message });
          return;
        }

        // Force immediate refetch
        await queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
        await queryClient.refetchQueries({ queryKey: ["evaluation-items"] });
        
        const updatedItems = items.filter((i) => i.id !== existingItem.id);
        onItemsChange(updatedItems);
      } else {
        const item: EvaluationItem = {
          report_id: reportId!,
          category: "A",
          indicator_name: "Proyectos I+D+i",
          score_obtained: newScore,
          project_entries: updatedEntries,
        };

        await saveItemMutation.mutateAsync(item);

        const updatedItems = items.filter((i) => i.indicator_name !== "Proyectos I+D+i");
        onItemsChange([...updatedItems, item]);
      }

      toast.success("Proyecto eliminado");
    } catch (err: any) {
      console.error("Delete project entry error:", err);
      toast.error("Error al eliminar", { description: err.message });
    }
  };

  const handleSaveProjectEntry = async (entryData: ProjectEntryData) => {
    if (!reportId) return;

    const existingItem = items.find((i) => i.indicator_name === "Proyectos I+D+i");
    // Map evidence_details to project_entries since DB stores as evidence_details
    const currentEntries: ProjectEntryData[] = (existingItem as any)?.project_entries 
      || (existingItem as any)?.evidence_details 
      || [];

    let updatedEntries: ProjectEntryData[];
    if (editingProjectEntry) {
      updatedEntries = currentEntries.map(e => 
        e.id === editingProjectEntry ? { ...entryData, id: e.id } : e
      );
    } else {
      updatedEntries = [...currentEntries, { ...entryData, id: crypto.randomUUID() }];
    }

    const indicator = INDICATORS.find(i => i.name === "Proyectos I+D+i");
    // Award MAX points if at least 1 entry exists
    const newScore = updatedEntries.length > 0 ? (indicator?.points || 0) : 0;

    const item: EvaluationItem = {
      report_id: reportId,
      category: "A",
      indicator_name: "Proyectos I+D+i",
      score_obtained: newScore,
      project_entries: updatedEntries,
    };

    await saveItemMutation.mutateAsync(item);

    const updatedItems = items.filter((i) => i.indicator_name !== "Proyectos I+D+i");
    onItemsChange([...updatedItems, item]);

    setProjectDialogOpen(false);
    setEditingProjectEntry(null);
    toast.success("Proyecto guardado correctamente");
  };

  const handleClearAll = async (indicatorName: string) => {
    if (!confirm("¿Estás seguro de eliminar todos los registros de esta sección? El puntaje volverá a 0.")) {
      return;
    }

    const existingItem = items.find((i) => i.indicator_name === indicatorName);
    
    if (existingItem?.id) {
      try {
        // Delete the entire evaluation_item row from database
        const { error } = await supabase
          .from("evaluation_items")
          .delete()
          .eq("id", existingItem.id)
          .eq("report_id", reportId!);

        if (error) {
          console.error("Delete error:", error);
          toast.error("Error al limpiar", { description: error.message });
          return;
        }

        // Force immediate refetch and UI update
        await queryClient.invalidateQueries({ queryKey: ["evaluation-items"] });
        await queryClient.refetchQueries({ queryKey: ["evaluation-items"] });
        
        const updatedItems = items.filter((i) => i.id !== existingItem.id);
        onItemsChange(updatedItems);
        
        toast.success("Sección limpiada correctamente");
      } catch (err: any) {
        console.error("Clear all error:", err);
        toast.error("Error al eliminar", { description: err.message });
      }
    }
  };

  const getItemData = (indicatorName: string) => {
    const isProject = indicatorName === "Proyectos I+D+i";
    const existing = items.find((i) => i.indicator_name === indicatorName);
    
    if (existing) {
      // Map evidence_details back to entries/project_entries if needed
      const mappedItem = {
        ...existing,
        entries: !isProject ? (existing.entries || (existing as any).evidence_details || []) : undefined,
        project_entries: isProject ? (existing.project_entries || (existing as any).evidence_details || []) : undefined,
      };
      return mappedItem;
    }

    return {
      score_obtained: 0,
      entries: isProject ? undefined : [],
      project_entries: isProject ? [] : undefined,
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

      {isReadOnly && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Modo solo lectura:</strong> Esta evaluación ha sido aprobada y no puede ser modificada.
          </p>
        </div>
      )}

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <p className="text-lg font-semibold text-primary">
          Puntos Sección A: {totalScore}/45
        </p>
      </div>

      <div className="space-y-4">
        {INDICATORS.map((indicator) => {
          const itemData = getItemData(indicator.name);
          const isProject = indicator.name === "Proyectos I+D+i";
          
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
                {/* Repeater Form for Projects */}
                {isProject && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Proyectos Registrados</h4>
                      {!isReadOnly && (
                        <Button
                          onClick={handleAddProjectEntry}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Proyecto
                        </Button>
                      )}
                    </div>

                    {(itemData.project_entries || []).length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          No hay proyectos registrados. Click en "Agregar Proyecto" para comenzar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(itemData.project_entries || []).map((entry, index) => {
                          const projectName = profiles?.find(p => p.id === entry.project_roles.principal)?.full_name || "Proyecto";
                          return (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    Proyecto {index + 1}: {projectName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {entry.proposal_type} • {entry.evidences.length} evidencias
                                  </p>
                                </div>
                              </div>
                              {!isReadOnly && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProjectEntry(entry.id!)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProjectEntry(entry.id!)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

                {/* Repeater Form for Non-Projects */}
                {!isProject && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Entradas Registradas</Label>
                      {!isReadOnly && (
                        <Button
                          onClick={() => handleAddEntry(indicator.name)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar {indicator.name}
                        </Button>
                      )}
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
                            {!isReadOnly && (
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
                            )}
                          </div>
                        ))}
                       </div>
                    )}

                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Entry Form Dialog for Articles/Books */}
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
              ? (() => {
                  const item = items.find((i) => i.indicator_name === editingEntry.indicator);
                  // Map evidence_details to entries if entries is not present
                  const entries = item?.entries || (item as any)?.evidence_details || [];
                  return entries.find((e: EntryData) => e.id === editingEntry.entryId);
                })()
              : undefined
          }
        />
      )}

      {/* Project Entry Dialog */}
      <ProjectEntryDialog
        open={projectDialogOpen}
        onClose={() => {
          setProjectDialogOpen(false);
          setEditingProjectEntry(null);
        }}
        onSave={handleSaveProjectEntry}
        reportId={reportId!}
        profiles={profiles || []}
        existingEntry={
          editingProjectEntry
            ? (() => {
                const item = items.find((i) => i.indicator_name === "Proyectos I+D+i");
                const entries = (item as any)?.project_entries || (item as any)?.evidence_details || [];
                return (entries as ProjectEntryData[]).find((e) => e.id === editingProjectEntry);
              })()
            : undefined
        }
      />
    </div>
  );
}
