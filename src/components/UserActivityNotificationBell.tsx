import { Bell, AlertTriangle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ActivityNotification {
  id: string;
  activity: string;
  endDate: string;
  status: "overdue" | "urgent" | "warning" | "observado";
  message: string;
}

export function UserActivityNotificationBell() {
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["user-activity-notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("assigned_tasks")
        .select(`
          id,
          status,
          admin_observations,
          planning_activities!inner(
            activity,
            end_date
          )
        `)
        .eq("user_id", user.id)
        .in("status", ["pending", "observado"]);

      if (error) throw error;

      const notifs: ActivityNotification[] = [];

      data?.forEach((task: any) => {
        const endDate = new Date(task.planning_activities.end_date);
        const daysLeft = differenceInDays(endDate, new Date());

        // Check for observations
        if (task.status === "observado") {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "observado",
            message: "Requiere corrección",
          });
        }
        // Check for overdue
        else if (isPast(endDate) && !isToday(endDate)) {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "overdue",
            message: `Venció hace ${Math.abs(daysLeft)} días`,
          });
        }
        // Check for urgent (3 days or less)
        else if (daysLeft <= 3 && daysLeft >= 0) {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "urgent",
            message: daysLeft === 0 ? "Vence hoy" : `Vence en ${daysLeft} días`,
          });
        }
        // Check for warning (7 days or less)
        else if (daysLeft <= 7) {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "warning",
            message: `Vence en ${daysLeft} días`,
          });
        }
      });

      // Sort by priority: overdue first, then observado, then urgent, then warning
      const priority = { overdue: 0, observado: 1, urgent: 2, warning: 3 };
      return notifs.sort((a, b) => priority[a.status] - priority[b.status]);
    },
    refetchInterval: 30000,
  });

  const urgentCount = notifications.filter(n => n.status === "overdue" || n.status === "urgent" || n.status === "observado").length;
  const hasNotifications = notifications.length > 0;

  if (!hasNotifications) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      case "urgent":
        return <Badge className="bg-orange-500">Urgente</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500 text-black">Próximo</Badge>;
      case "observado":
        return <Badge variant="destructive">Observado</Badge>;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <motion.div
            animate={urgentCount > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Bell className={`h-5 w-5 ${urgentCount > 0 ? "text-destructive" : ""}`} />
          </motion.div>
          {urgentCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold"
            >
              {urgentCount > 9 ? "9+" : urgentCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Actividades Pendientes ({notifications.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.slice(0, 10).map((notif) => (
          <DropdownMenuItem
            key={notif.id}
            onClick={() => navigate("/my-tasks")}
            className="cursor-pointer py-3"
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate flex-1">{notif.activity}</p>
                {getStatusBadge(notif.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {notif.message} • Fecha límite: {format(new Date(notif.endDate), "dd/MM/yyyy", { locale: es })}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/my-tasks")}
              className="cursor-pointer text-center justify-center text-sm text-muted-foreground"
            >
              Ver todas las actividades ({notifications.length})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
