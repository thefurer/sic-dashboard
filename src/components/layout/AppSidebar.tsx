import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, Users, UserPlus, FileText, CheckSquare, CalendarClock, Settings, Landmark, FolderOpen, ChevronDown } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

// Base menu items visible to all users
const baseMenuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
}, {
  title: "Información GISICF",
  url: "/institutional",
  icon: Landmark
}];

// Menu items only for regular users (not admin)
const userOnlyItems = [{
  title: "Evaluación",
  url: "/evaluation",
  icon: ClipboardCheck
}, {
  title: "Mis Actividades",
  url: "/my-tasks",
  icon: CheckSquare
}];

// Admin menu items grouped
const adminItems = [{
  title: "Solicitudes Pendientes",
  url: "/admin/pending-approvals",
  icon: UserPlus
}, {
  title: "Directorio de Usuarios",
  url: "/admin/users",
  icon: Users
}, {
  title: "Planificación Estratégica",
  url: "/admin/planning",
  icon: CalendarClock
}, {
  title: "Proyectos Oficiales",
  url: "/admin/projects-list",
  icon: FolderOpen
}];
const reviewItems = [{
  title: "Revisión de Evaluaciones",
  url: "/admin/evaluations",
  icon: FileText
}, {
  title: "Revisión de Actividades",
  url: "/admin/task-reviews",
  icon: CheckSquare
}, {
  title: "Configuración",
  url: "/admin/settings",
  icon: Settings
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const {
    data: userRole
  } = useUserRole();
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
  const MenuItem = ({
    item
  }: {
    item: {
      title: string;
      url: string;
      icon: React.ComponentType<{
        className?: string;
      }>;
    };
  }) => {
    const active = isActive(item.url);
    const linkContent = <NavLink to={item.url} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${active ? 'sidebar-active-glow bg-[hsl(153,100%,24%)]/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'} ${!isExpanded ? 'justify-center px-3' : ''}`} activeClassName="">
        <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${active ? 'text-[hsl(153,100%,35%)] drop-shadow-[0_0_10px_hsla(153,100%,35%,0.8)]' : 'group-hover:text-[hsl(153,100%,35%)] group-hover:drop-shadow-[0_0_8px_hsla(153,100%,35%,0.5)]'}`} />
        {isExpanded && <span className={`font-medium truncate ${active ? 'text-white' : ''}`}>
            {item.title}
          </span>}
      </NavLink>;
    if (!isExpanded) {
      return <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                {linkContent}
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 text-white border-white/20 px-3 py-2 rounded-lg shadow-xl" sideOffset={8}>
                <span className="font-medium">{item.title}</span>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuButton>
        </SidebarMenuItem>;
    }
    return <SidebarMenuItem>
        <SidebarMenuButton asChild>
          {linkContent}
        </SidebarMenuButton>
      </SidebarMenuItem>;
  };
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
  }) => <Collapsible open={isExpanded ? open : true} onOpenChange={onOpenChange}>
      {isExpanded && <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold tracking-wider text-white/40 uppercase hover:text-white/60 transition-colors">
          <span>{title}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>}
      {!isExpanded && <div className="w-full flex justify-center py-2">
          <div className="w-8 h-[1px] bg-white/20 rounded-full" />
        </div>}
      <CollapsibleContent className="space-y-1 mt-1">
        <SidebarMenu>
          {items.map(item => <MenuItem key={item.title} item={item} />)}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>;
  return <Sidebar variant="floating" className={`${isExpanded ? "w-72" : "w-16"} transition-all duration-300 h-[calc(100vh-2rem)]`} collapsible="icon">
      <SidebarContent className="glass-card-premium bg-slate-900/80 h-full rounded-[30px] overflow-hidden">
        {/* Logo Header with green glow */}
        <div className="p-6 border-b border-white/10 flex items-center justify-center">
          {isExpanded ? <div className="text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[hsla(153,100%,24%,0.4)] blur-2xl rounded-full scale-150" />
                <h2 className="relative text-2xl font-bold text-white tracking-tight">UNESUM</h2>
              </div>
              <p className="text-xs text-white/50 mt-2">Sistemas Inteligentes y Ciberfísicos</p>
            </div> : <div className="relative">
              <div className="absolute inset-0 bg-[hsla(153,100%,24%,0.5)] blur-xl rounded-xl scale-150" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(153,100%,24%)] to-[hsl(153,100%,32%)] flex items-center justify-center text-white font-bold text-lg shadow-lg glow-green">
                U
              </div>
            </div>}
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 space-y-4 px-3">
          {/* Navigation Group */}
          <SidebarGroup>
            <CollapsibleGroup title="Navegación" items={baseMenuItems} open={navOpen} onOpenChange={setNavOpen} />
          </SidebarGroup>

          {/* User Only Items */}
          {!isAdmin && <SidebarGroup>
              <CollapsibleGroup title="Usuario" items={userOnlyItems} open={userOpen} onOpenChange={setUserOpen} />
            </SidebarGroup>}

          {/* Admin Groups */}
          {isAdmin && <>
              <SidebarGroup>
                <CollapsibleGroup title="Administración" items={adminItems} open={adminOpen} onOpenChange={setAdminOpen} />
              </SidebarGroup>

              <SidebarGroup>
                <CollapsibleGroup title="Revisiones" items={reviewItems} open={reviewOpen} onOpenChange={setReviewOpen} />
              </SidebarGroup>
            </>}
        </div>
        
        {/* Bottom branding */}
        <div className="p-4 border-t border-white/10">
          {isExpanded ? <p className="text-[10px] text-white/30 text-center">© 2026 GISICF - UNESUM</p> : <div className="w-2 h-2 rounded-full bg-[hsl(153,100%,35%)] mx-auto glow-green" />}
        </div>
      </SidebarContent>
    </Sidebar>;
}