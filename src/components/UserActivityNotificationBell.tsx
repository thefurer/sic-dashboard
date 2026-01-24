import { Bell, AlertTriangle, Sparkles, Check, Eye } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ActivityNotification {
  id: string;
  activity: string;
  endDate: string;
  status: "new" | "overdue" | "urgent" | "warning" | "observado";
  message: string;
  createdAt?: string;
  isRead: boolean;
  readAt?: string;
}

export function UserActivityNotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
          read_at,
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
        const isRead = !!task.read_at;
        const readAt = task.read_at;

        // Check for observations first (highest priority after overdue)
        if (task.status === "observado") {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "observado",
            message: "Requiere corrección",
            isRead,
            readAt,
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
            isRead,
            readAt,
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
            isRead,
            readAt,
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
            isRead,
            readAt,
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
            isRead,
            readAt,
          });
        }
        // ALL other pending tasks should still show (normal priority)
        else if (task.status === "pending") {
          notifs.push({
            id: task.id,
            activity: task.planning_activities.activity,
            endDate: task.planning_activities.end_date,
            status: "warning",
            message: `Pendiente • Vence el ${format(endDate, "dd/MM", { locale: es })}`,
            isRead,
            readAt,
          });
        }
      });

      // Sort by: unread first, then by priority
      const priority = { new: 0, overdue: 1, observado: 2, urgent: 3, warning: 4 };
      return notifs.sort((a, b) => {
        // Unread items first
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        // Then by priority
        return priority[a.status] - priority[b.status];
      });
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("assigned_tasks")
        .update({ read_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activity-notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("assigned_tasks")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activity-notifications"] });
      toast({
        title: "Notificaciones marcadas como leídas",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    },
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

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => 
    !n.isRead && (n.status === "overdue" || n.status === "urgent" || n.status === "observado" || n.status === "new")
  ).length;
  const hasNotifications = notifications.length > 0;

  if (!hasNotifications) {
    return null;
  }

  const handleNotificationClick = (notif: ActivityNotification) => {
    if (!notif.isRead) {
      markAsReadMutation.mutate(notif.id);
    }
    navigate("/my-tasks");
  };

  const getStatusBadge = (status: string, isRead: boolean) => {
    const opacity = isRead ? "opacity-60" : "";
    switch (status) {
      case "new":
        return <Badge className={`bg-primary text-primary-foreground ${opacity}`}>Nueva</Badge>;
      case "overdue":
        return <Badge variant="destructive" className={opacity}>Vencido</Badge>;
      case "urgent":
        return <Badge className={`bg-orange-500 ${opacity}`}>Urgente</Badge>;
      case "warning":
        return <Badge className={`bg-yellow-500 text-black ${opacity}`}>Próximo</Badge>;
      case "observado":
        return <Badge variant="destructive" className={opacity}>Observado</Badge>;
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
            {unreadCount > 0 ? (
              <Sparkles className="h-5 w-5 text-primary" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </motion.div>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center font-semibold bg-primary text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[450px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <>
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Notificaciones ({unreadCount} sin leer)</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Actividades Pendientes ({notifications.length})</span>
              </>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.preventDefault();
                markAllAsReadMutation.mutate();
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.slice(0, 10).map((notif) => (
          <DropdownMenuItem
            key={notif.id}
            onClick={() => handleNotificationClick(notif)}
            className={`cursor-pointer py-3 ${notif.isRead ? "opacity-70" : "bg-accent/30"}`}
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  {notif.isRead && (
                    <Eye className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <p className={`text-sm truncate ${notif.isRead ? "text-muted-foreground" : "font-medium"}`}>
                    {notif.activity}
                  </p>
                </div>
                {getStatusBadge(notif.status, notif.isRead)}
              </div>
              <p className="text-xs text-muted-foreground ml-4">
                {notif.message} • Fecha límite: {format(new Date(notif.endDate), "dd/MM/yyyy", { locale: es })}
              </p>
              {notif.isRead && notif.readAt && (
                <p className="text-xs text-muted-foreground/60 ml-4">
                  Leído el {format(new Date(notif.readAt), "dd/MM HH:mm", { locale: es })}
                </p>
              )}
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