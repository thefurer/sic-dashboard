import { Bell, AlertTriangle, Sparkles } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { format, differenceInDays, isPast, isToday, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ActivityNotification {
  id: string;
  activity: string;
  endDate: string;
  status: "new" | "overdue" | "urgent" | "warning" | "observado";
  message: string;
  createdAt?: string;
}

export function UserActivityNotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previousCountRef = useRef<number>(0);

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
          created_at,
          planning_activities!inner(
            activity,
            end_date
          )
        `)
        .eq("user_id", user.id)
        .in("status", ["pending", "observado"]);

      if (error) throw error;

      const notifs: ActivityNotification[] = [];
      const now = new Date();

      data?.forEach((task: any) => {
        const endDate = new Date(task.planning_activities.end_date);
        const createdAt = new Date(task.created_at);
        const daysLeft = differenceInDays(endDate, now);
        const hoursAgo = differenceInHours(now, createdAt);

        // Check for observations first (highest priority after overdue)
        if (task.status === "observado") {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "observado",
            message: "Requiere corrección",
          });
          return;
        }

        // Check for newly assigned tasks (within last 48 hours)
        if (task.status === "pending" && hoursAgo <= 48) {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "new",
            message: hoursAgo < 1 ? "Recién asignada" : `Asignada hace ${hoursAgo}h`,
            createdAt: task.created_at,
          });
          return;
        }

        // Check for overdue
        if (isPast(endDate) && !isToday(endDate)) {
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
        // ALL other pending tasks should still show (normal priority)
        else if (task.status === "pending") {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "warning", // Use warning style but with different message
            message: `Pendiente • Vence el ${format(endDate, "dd/MM", { locale: es })}`,
          });
        }
      });

      // Sort by priority: new first, then overdue, then observado, then urgent, then warning
      const priority = { new: 0, overdue: 1, observado: 2, urgent: 3, warning: 4 };
      return notifs.sort((a, b) => priority[a.status] - priority[b.status]);
    },
    refetchInterval: 15000, // Faster polling for new assignments (15 seconds)
    refetchOnWindowFocus: true,
  });

  // Subscribe to real-time changes for assigned_tasks
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('assigned_tasks_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assigned_tasks',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Invalidate and refetch notifications when a new task is assigned
            queryClient.invalidateQueries({ queryKey: ["user-activity-notifications"] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'assigned_tasks',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["user-activity-notifications"] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [queryClient]);

  const newCount = notifications.filter(n => n.status === "new").length;
  const urgentCount = notifications.filter(n => 
    n.status === "overdue" || n.status === "urgent" || n.status === "observado" || n.status === "new"
  ).length;
  const hasNotifications = notifications.length > 0;

  if (!hasNotifications) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-primary text-primary-foreground">Nueva</Badge>;
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
            {newCount > 0 ? (
              <Sparkles className="h-5 w-5 text-primary" />
            ) : (
              <Bell className={`h-5 w-5 ${urgentCount > 0 ? "text-destructive" : ""}`} />
            )}
          </motion.div>
          {urgentCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center font-semibold ${
                newCount > 0 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {urgentCount > 9 ? "9+" : urgentCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center gap-2">
          {newCount > 0 ? (
            <>
              <Sparkles className="h-4 w-4 text-primary" />
              Nuevas Actividades Asignadas ({newCount})
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Actividades Pendientes ({notifications.length})
            </>
          )}
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
