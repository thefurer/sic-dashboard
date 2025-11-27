import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Plus, Pencil, Trash2 } from "lucide-react";
import { ActivityDialog } from "./ActivityDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PlanningActivitiesStepProps {
  planId: string | null;
  setPlanId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface Activity {
  id: string;
  activity: string;
  objective: string;
  start_date: string;
  end_date: string;
  verification_means: string;
  responsibles: any;
  order_index: number;
}

export function PlanningActivitiesStep({
  planId,
  onNext,
  onBack,
}: PlanningActivitiesStepProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      loadActivities();
    }
  }, [planId]);

  const loadActivities = async () => {
    if (!planId) return;

    const { data, error } = await supabase
      .from("planning_activities")
      .select("*")
      .eq("plan_id", planId)
      .order("order_index");

    if (error) {
      toast.error("Error al cargar actividades");
      return;
    }

    setActivities(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta actividad?")) return;

    const { error } = await supabase
      .from("planning_activities")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error al eliminar");
      return;
    }

    toast.success("Actividad eliminada");
    loadActivities();
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingActivity(null);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    loadActivities();
    setDialogOpen(false);
    setEditingActivity(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cronograma de Actividades</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Actividad
        </Button>
      </div>

      {activities.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">N°</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Responsables</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={activity.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{activity.activity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {activity.objective}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(activity.start_date), "dd/MM/yyyy", { locale: es })} -{" "}
                    {format(new Date(activity.end_date), "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {activity.responsibles.map((resp, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {resp}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(activity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p>No hay actividades registradas</p>
          <Button onClick={handleAddNew} className="mt-4" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Primera Actividad
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={activities.length === 0}>
          Siguiente
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        planId={planId}
        activity={editingActivity}
        onSaved={handleSaved}
        nextOrderIndex={activities.length}
      />
    </div>
  );
}
