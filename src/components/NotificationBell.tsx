import { Bell, FileText, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

export function NotificationBell() {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  // Pending user approvals count
  const { data: pendingUsersCount = 0 } = useQuery({
    queryKey: ["pending-approvals-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  // Pending evaluations count (submitted status)
  const { data: pendingEvaluationsCount = 0 } = useQuery({
    queryKey: ["pending-evaluations-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("evaluation_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const totalNotifications = pendingUsersCount + pendingEvaluationsCount;

  if (!isAdmin) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Pending User Registrations */}
        {pendingUsersCount > 0 && (
          <DropdownMenuItem
            onClick={() => navigate("/admin/pending-approvals")}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <UserPlus className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="font-medium">Solicitudes Pendientes</p>
                <p className="text-sm text-muted-foreground">
                  {pendingUsersCount} {pendingUsersCount === 1 ? "usuario espera" : "usuarios esperan"} aprobación
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        )}

        {/* Pending Evaluations */}
        {pendingEvaluationsCount > 0 && (
          <>
            {pendingUsersCount > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => navigate("/admin/evaluaciones")}
              className="cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Evaluaciones por Revisar</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingEvaluationsCount} {pendingEvaluationsCount === 1 ? "evaluación requiere" : "evaluaciones requieren"} revisión
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {/* No notifications */}
        {totalNotifications === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No hay notificaciones nuevas
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
