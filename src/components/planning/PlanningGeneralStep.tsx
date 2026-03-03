import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Calendar as CalendarIcon, Plus, X, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PERIOD_OPTIONS = [
  'PI 2024', 'PII 2024', 'PI 2025', 'PII 2025', 'PI 2026', 'PII 2026', 'PI 2027', 'PII 2027', 'PI 2028', 'PII 2028', 'PI 2029', 'PII 2029', 'PI 2030', 'PII 2030'
];

interface PlanningGeneralStepProps {
  planId: string | null;
  setPlanId: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function PlanningGeneralStep({ planId, setPlanId, onNext }: PlanningGeneralStepProps) {
  const [periodName, setPeriodName] = useState("");
  const [presidentName, setPresidentName] = useState("Ing. Christian Ruperto Caicedo Plúa, PhD.");
  const [meetingDates, setMeetingDates] = useState<Array<{ date: Date; time: string }>>([]);
  const [driveLink, setDriveLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCustomPeriodOpen, setIsCustomPeriodOpen] = useState(false);
  const [customPeriod, setCustomPeriod] = useState("");
  const [tempDate, setTempDate] = useState<Date>();
  const [tempTime, setTempTime] = useState("14:00");

  useEffect(() => {
    if (planId) {
      loadPlanData();
    }
  }, [planId]);

  const loadPlanData = async () => {
    if (!planId) return;

    const { data, error } = await supabase.from("planning_sheets").select("*").eq("id", planId).single();

    if (error) {
      toast.error("Error al cargar los datos");
      return;
    }

    if (data) {
      setPeriodName(data.period_name);
      setPresidentName(data.president_name);
      
      // Parse meeting_schedule from JSONB array (now with times)
      if (data.meeting_schedule && Array.isArray(data.meeting_schedule)) {
        const meetings = data.meeting_schedule
          .map((item: any) => {
            if (typeof item === 'string') {
              // Legacy format: just date string
              const date = new Date(item);
              return !isNaN(date.getTime()) ? { date, time: "14:00" } : null;
            } else if (item.date) {
              // New format: {date, time}
              const date = new Date(item.date);
              return !isNaN(date.getTime()) ? { date, time: item.time || "14:00" } : null;
            }
            return null;
          })
          .filter((item): item is { date: Date; time: string } => item !== null);
        setMeetingDates(meetings);
      }
      
      setDriveLink(data.drive_link || "");
    }
  };

  const handleSave = async () => {
    if (!periodName.trim()) {
      toast.error("El nombre del período es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      // Convert meeting dates to new format
      const meetingScheduleData = meetingDates.map(m => ({ 
        date: m.date.toISOString(), 
        time: m.time 
      }));

      if (planId) {
        const { error } = await supabase
          .from("planning_sheets")
          .update({
            period_name: periodName,
            president_name: presidentName,
            meeting_schedule: meetingScheduleData,
            drive_link: driveLink,
          })
          .eq("id", planId);

        if (error) throw error;
        toast.success("Datos actualizados");
      } else {
        const { data, error } = await supabase
          .from("planning_sheets")
          .insert({
            period_name: periodName,
            president_name: presidentName,
            meeting_schedule: meetingScheduleData,
            drive_link: driveLink,
            created_by: userData.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPlanId(data.id);
          toast.success("Planificación creada");
        }
      }

      onNext();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomPeriod = () => {
    if (customPeriod.trim()) {
      setPeriodName(customPeriod.trim());
      setIsCustomPeriodOpen(false);
      setCustomPeriod("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="periodName">Nombre del Período *</Label>
        <Select value={periodName} onValueChange={(value) => {
          if (value === "custom") {
            setIsCustomPeriodOpen(true);
          } else {
            setPeriodName(value);
          }
        }}>
          <SelectTrigger id="periodName">
            <SelectValue placeholder="Selecciona un período" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Período Personalizado
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {periodName && !PERIOD_OPTIONS.includes(periodName) && (
          <p className="text-sm text-muted-foreground mt-1">Período personalizado: {periodName}</p>
        )}
      </div>

      <div>
        <Label htmlFor="presidentName">Coordinador GISICF</Label>
        <Input id="presidentName" value={presidentName} onChange={(e) => setPresidentName(e.target.value)} />
      </div>

      <div>
        <Label>Fechas y Horarios de Reuniones</Label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Agregar reunión
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-3">
                <Calendar
                  mode="single"
                  selected={tempDate}
                  onSelect={setTempDate}
                  initialFocus
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  className={cn("pointer-events-auto")}
                  locale={es}
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={tempTime}
                    onChange={(e) => setTempTime(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={!tempDate}
                  onClick={() => {
                    if (tempDate) {
                      setMeetingDates([...meetingDates, { date: tempDate, time: tempTime }]);
                      setTempDate(undefined);
                      setTempTime("14:00");
                    }
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {meetingDates.length > 0 && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Reuniones programadas:</p>
              <div className="space-y-2">
                {meetingDates.map((meeting, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-background p-2 rounded">
                    <span>
                      {format(meeting.date, "dd/MM/yyyy", { locale: es })} - {meeting.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMeetingDates(meetingDates.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="driveLink">Enlace de Drive (Opcional)</Label>
        <Input
          id="driveLink"
          type="url"
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
          placeholder="https://drive.google.com/..."
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Guardando..." : "Siguiente"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isCustomPeriodOpen} onOpenChange={setIsCustomPeriodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Período Personalizado</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del período personalizado (Ej: PI 2031, PII 2031)
            </DialogDescription>
          </DialogHeader>
          <Input
            value={customPeriod}
            onChange={(e) => setCustomPeriod(e.target.value)}
            placeholder="Ej: PI 2031"
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomPeriod()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomPeriodOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCustomPeriod}>
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
