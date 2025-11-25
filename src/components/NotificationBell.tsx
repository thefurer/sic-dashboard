import { Bell } from "lucide-react";
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
  const { data: userRole } = useUserRole();

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["pending-approvals-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: userRole === "admin",
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (userRole !== "admin") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pendingCount > 0 ? (
          <DropdownMenuItem
            onClick={() => navigate("/admin/pending-approvals")}
            className="cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium">Solicitudes Pendientes</p>
              <p className="text-sm text-muted-foreground">
                Tienes {pendingCount} {pendingCount === 1 ? "solicitud" : "solicitudes"} de registro pendiente
                {pendingCount === 1 ? "" : "s"} de aprobación
              </p>
            </div>
          </DropdownMenuItem>
        ) : (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No hay notificaciones nuevas
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
