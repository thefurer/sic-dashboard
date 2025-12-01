import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function UserNotificationBell() {
  const navigate = useNavigate();

  const { data: observation } = useQuery({
    queryKey: ["user-evaluation-observations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from("evaluation_reports")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", currentYear)
        .eq("status", "needs_correction")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const hasObservation = observation && observation.admin_observations;

  if (!hasObservation) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Badge variant="destructive">Observación</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">
                Tu evaluación tiene observaciones
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {observation.admin_observations}
              </p>
              {observation.correction_deadline && (
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Fecha límite:</span>{" "}
                  {format(new Date(observation.correction_deadline), "dd 'de' MMMM, yyyy", { locale: es })}
                </p>
              )}
              <DropdownMenuItem
                onClick={() => navigate("/evaluation")}
                className="cursor-pointer px-0 mt-2"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Ir a Evaluación
                </Button>
              </DropdownMenuItem>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
