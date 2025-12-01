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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { UserNotificationBell } from "@/components/UserNotificationBell";
import { useUserRole } from "@/hooks/useUserRole";

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col items-center pt-3 pr-3 pb-3 pl-0">
          <div className="w-full h-full max-w-[1400px] rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <header className="h-16 flex items-center px-6 gap-4 sticky top-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm">
              <SidebarTrigger />
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mr-2 hover:bg-white/30 dark:hover:bg-slate-800/30 rounded-2xl transition-all"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              {userRole === "admin" ? <NotificationBell /> : <UserNotificationBell />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity group active:scale-95">
                    <div className="text-right max-w-[180px]">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="transform transition-transform group-hover:-translate-y-1">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">{getInitials(displayName)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl shadow-xl">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">{getInitials(displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-semibold">{displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    onClick={() => { window.location.href = '/profile'; }}
                    className="hover:bg-white/20 dark:hover:bg-slate-800/30 rounded-2xl cursor-pointer transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="text-destructive hover:bg-red-500/10 rounded-2xl cursor-pointer transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
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
