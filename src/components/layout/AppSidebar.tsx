import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  UserPlus,
  FileText,
  CheckSquare,
  CalendarClock,
  Settings,
  Landmark,
  FolderOpen,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Base menu items visible to all users
const baseMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Institucional", url: "/institutional", icon: Landmark },
];

// Menu items only for regular users (not admin)
const userOnlyItems = [
  { title: "Evaluación", url: "/evaluation", icon: ClipboardCheck },
  { title: "Mis Actividades", url: "/my-tasks", icon: CheckSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar 
      className={state === "collapsed" ? "w-14" : "w-64"} 
      collapsible="icon"
    >
      <SidebarContent className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          {state === "expanded" ? (
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">UNESUM</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Sistemas Inteligentes</p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              U
            </div>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 dark:text-slate-400 text-xs font-medium px-3">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Base menu items for all users */}
              {baseMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* User-only menu items (hidden from admin) */}
              {!isAdmin && userOnlyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin-only menu items */}
              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/pending-approvals"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <UserPlus className="h-5 w-5" />
                        {state === "expanded" && <span>Solicitudes Pendientes</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/users"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <Users className="h-5 w-5" />
                        {state === "expanded" && <span>Directorio de Usuarios</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/planning"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <CalendarClock className="h-5 w-5" />
                        {state === "expanded" && <span>Planificación Estratégica</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/projects-list"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <FolderOpen className="h-5 w-5" />
                        {state === "expanded" && <span>Proyectos Oficiales</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/evaluations"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <FileText className="h-5 w-5" />
                        {state === "expanded" && <span>Revisión de Evaluaciones</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/task-reviews"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <CheckSquare className="h-5 w-5" />
                        {state === "expanded" && <span>Revisión de Actividades</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/settings"
                        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        activeClassName="bg-primary/10 text-primary font-medium border-r-2 border-primary"
                      >
                        <Settings className="h-5 w-5" />
                        {state === "expanded" && <span>Configuración</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
