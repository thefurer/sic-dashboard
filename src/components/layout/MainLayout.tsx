import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Sun, Moon, Shield, BadgeCheck } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { UserNotificationBell } from "@/components/UserNotificationBell";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, setTheme } = useTheme();
  const { data: userRole } = useUserRole();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = profile?.avatar_url;
  const isAdmin = userRole === "admin";

  const getRoleBadge = () => {
    if (isAdmin) return { label: "Administrador", variant: "default" as const, icon: Shield };
    if (userRole === "researcher") return { label: "Investigador", variant: "secondary" as const, icon: BadgeCheck };
    return { label: "Estudiante", variant: "outline" as const, icon: User };
  };

  const roleBadge = getRoleBadge();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-[1300px] m-3 rounded-2xl glass-card overflow-hidden">
            {/* Premium Glass Header */}
            <header className="h-16 flex items-center px-6 gap-4 sticky top-0 z-50 glass-header">
              <SidebarTrigger className="hover:bg-white/10 dark:hover:bg-white/5 transition-colors" />
              <div className="flex-1" />
              
              {/* Theme Toggle with Glow */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mr-2 hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              {userRole === "admin" ? <NotificationBell /> : <UserNotificationBell />}
              
              {/* Premium Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 group p-1.5 rounded-xl hover:bg-white/5">
                    <div className="text-right max-w-[180px] hidden sm:block">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="relative transform transition-transform group-hover:-translate-y-0.5">
                      <div className="absolute inset-0 bg-primary/40 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Avatar className="w-10 h-10 ring-2 ring-primary/50 group-hover:ring-primary transition-all">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-72 p-0 glass-card-dark border-white/10"
                >
                  {/* Profile Header */}
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-transparent">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full" />
                        <Avatar className="w-14 h-14 ring-2 ring-primary relative">
                          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">{displayName}</span>
                          <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        <Badge variant={roleBadge.variant} className="mt-1.5 text-[10px] h-5">
                          <roleBadge.icon className="h-3 w-3 mr-1" />
                          {roleBadge.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuGroup className="p-2">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => { window.location.href = '/profile'; }}
                      className="cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <User className="mr-3 h-4 w-4 text-primary" />
                      <span>Ver Perfil</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  
                  <DropdownMenuGroup className="p-2">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">Sesión</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={signOut} 
                      className="cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            
            <div className="flex-1 p-6 overflow-auto bg-transparent">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
