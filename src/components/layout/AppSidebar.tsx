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
  ChevronDown,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

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

// Admin menu items grouped
const adminItems = [
  { title: "Solicitudes Pendientes", url: "/admin/pending-approvals", icon: UserPlus },
  { title: "Directorio de Usuarios", url: "/admin/users", icon: Users },
  { title: "Planificación Estratégica", url: "/admin/planning", icon: CalendarClock },
  { title: "Proyectos Oficiales", url: "/admin/projects-list", icon: FolderOpen },
];

const reviewItems = [
  { title: "Revisión de Evaluaciones", url: "/admin/evaluations", icon: FileText },
  { title: "Revisión de Actividades", url: "/admin/task-reviews", icon: CheckSquare },
  { title: "Configuración", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === "admin";
  const isExpanded = state === "expanded";

  const [navOpen, setNavOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(path);
  };

  const MenuItem = ({ item }: { item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> } }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
          activeClassName="bg-primary/20 text-white border-l-[3px] border-primary shadow-lg shadow-primary/10"
        >
          <item.icon className="h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          {isExpanded && <span className="font-medium">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const CollapsibleGroup = ({ 
    title, 
    items, 
    open, 
    onOpenChange 
  }: { 
    title: string; 
    items: typeof baseMenuItems; 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
  }) => (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition-colors ${!isExpanded && 'justify-center'}`}>
        {isExpanded && <span>{title}</span>}
        {isExpanded && (
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        <SidebarMenu>
          {items.map((item) => (
            <MenuItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Sidebar
      variant="floating"
      className={`${isExpanded ? "w-64" : "w-14"} transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="glass-sidebar bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        {/* Logo Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-center">
          {isExpanded ? (
            <div className="text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <h2 className="relative text-xl font-bold text-white tracking-tight">UNESUM</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Sistemas Inteligentes y Ciberfísicos</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-md rounded-lg" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                U
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
          {/* Navigation Group */}
          <SidebarGroup>
            <CollapsibleGroup 
              title="Navegación" 
              items={baseMenuItems} 
              open={navOpen} 
              onOpenChange={setNavOpen} 
            />
          </SidebarGroup>

          {/* User Only Items */}
          {!isAdmin && (
            <SidebarGroup>
              <CollapsibleGroup 
                title="Usuario" 
                items={userOnlyItems} 
                open={userOpen} 
                onOpenChange={setUserOpen} 
              />
            </SidebarGroup>
          )}

          {/* Admin Groups */}
          {isAdmin && (
            <>
              <SidebarGroup>
                <CollapsibleGroup 
                  title="Administración" 
                  items={adminItems} 
                  open={adminOpen} 
                  onOpenChange={setAdminOpen} 
                />
              </SidebarGroup>

              <SidebarGroup>
                <CollapsibleGroup 
                  title="Revisiones" 
                  items={reviewItems} 
                  open={reviewOpen} 
                  onOpenChange={setReviewOpen} 
                />
              </SidebarGroup>
            </>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
