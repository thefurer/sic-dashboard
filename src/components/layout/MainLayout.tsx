import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { LegalFooter } from "./LegalFooter";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { PageTransition } from "@/components/PageTransition";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { useEffect } from "react";
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
import { UserActivityNotificationBell } from "@/components/UserActivityNotificationBell";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { TourGuideButton } from "@/components/tour/TourGuideButton";
import { useTour } from "@/components/tour/TourProvider";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import gisicfLogo from "@/assets/gisicf-logo.png";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, setTheme } = useTheme();
  const { data: userRole } = useUserRole();
  const { startTour, hasSeenTour } = useTour();
  const location = useLocation();
  // Theme is now user-controlled (no longer forced)

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
      {/* Main container with theme-aware background */}
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {/* Background gradient orbs - institutional green (only visible in dark mode) */}
        <div className="fixed inset-0 pointer-events-none dark:block hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(153,100%,24%,0.15),transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsla(153,100%,24%,0.1),transparent_60%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,hsla(153,100%,24%,0.05),transparent_70%)]" />
        </div>
        
        {/* Light mode subtle gradient */}
        <div className="fixed inset-0 pointer-events-none dark:hidden block bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        
        {/* Floating Sidebar */}
        <div className="m-4 z-20">
          <AppSidebar />
        </div>
        
        <main className="flex-1 flex flex-col p-4 z-10">
          {/* Floating Glass Navbar */}
          <header className="glass-navbar h-16 flex items-center px-6 gap-4 mb-6">
            <SidebarTrigger className="text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors rounded-xl" />
            
            {/* Logo in navbar */}
            <div className="flex items-center gap-3">
              <img src={gisicfLogo} alt="GISICF" className="h-8 w-auto" />
              <span className="text-foreground/90 font-semibold hidden sm:block">GISICF</span>
            </div>
            
            <div className="flex-1" />
            
            {/* Theme Toggle with Green Glow */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-all duration-300 hover:shadow-[0_0_15px_hsla(153,100%,24%,0.4)] rounded-xl"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <div data-tour="tour-button">
              <TourGuideButton onClick={startTour} hasSeenTour={hasSeenTour} />
            </div>
            
            <div data-tour="notifications" className="flex items-center gap-1">
              <UserActivityNotificationBell />
              {userRole === "admin" ? <NotificationBell /> : <UserNotificationBell />}
            </div>
            
            {/* Premium Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-tour="profile-menu" className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 group p-1.5 rounded-xl hover:bg-foreground/5">
                  <div className="text-right max-w-[180px] hidden sm:block">
                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="relative transform transition-transform group-hover:-translate-y-0.5">
                    <div className="absolute inset-0 bg-primary/50 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
                className="w-72 p-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl"
              >
                {/* Profile Header */}
                <div className="p-4 bg-gradient-to-br from-[hsla(153,100%,24%,0.2)] to-transparent rounded-t-2xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[hsla(153,100%,24%,0.4)] blur-lg rounded-full" />
                      <Avatar className="w-14 h-14 ring-2 ring-[hsl(153,100%,24%)] relative">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-[hsl(153,100%,24%)] to-[hsl(153,100%,32%)] text-white text-lg font-semibold">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{displayName}</span>
                        <BadgeCheck className="h-4 w-4 text-[hsl(153,100%,35%)] shrink-0" />
                      </div>
                      <p className="text-xs text-white/50 truncate">{user?.email}</p>
                      <Badge variant={roleBadge.variant} className="mt-1.5 text-[10px] h-5 bg-[hsla(153,100%,24%,0.2)] text-[hsl(153,100%,45%)] border-[hsla(153,100%,24%,0.3)]">
                        <roleBadge.icon className="h-3 w-3 mr-1" />
                        {roleBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuGroup className="p-2">
                  <DropdownMenuLabel className="text-xs text-white/40 font-normal px-2">Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => { window.location.href = '/profile'; }}
                    className="cursor-pointer rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <User className="mr-3 h-4 w-4 text-[hsl(153,100%,35%)]" />
                    <span>Ver Perfil</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuGroup className="p-2">
                  <DropdownMenuLabel className="text-xs text-white/40 font-normal px-2">Sesión</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="cursor-pointer rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          
          {/* Main Content Area - Glass Container */}
          <div className="flex-1 glass-card-premium p-8 overflow-auto">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </div>
          
          <div className="mt-4">
            <LegalFooter />
          </div>
        </main>
        <AccessibilityMenu />
      </div>
    </SidebarProvider>
  );
}