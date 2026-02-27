import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'researcher' | 'student';
}

// Mapa de rutas a mensajes personalizados
const routeMessages: Record<string, string> = {
  "/dashboard": "Cargando panel principal...",
  "/profile": "Cargando tu perfil...",
  "/projects": "Cargando proyectos...",
  "/evaluation": "Cargando evaluación...",
  "/impacts": "Cargando impactos...",
  "/vinculacion": "Cargando vinculación...",
  "/scientific-production": "Cargando producción científica...",
  "/my-tasks": "Cargando tus tareas...",
  "/institutional": "Cargando información GISICF...",
  "/admin/pending-approvals": "Cargando solicitudes pendientes...",
  "/admin/users": "Cargando directorio de usuarios...",
  "/admin/settings": "Cargando configuración...",
  "/admin/planning": "Cargando planificaciones...",
  "/admin/planning-builder": "Cargando constructor de planificación...",
  "/admin/evaluation-reviews": "Cargando revisión de evaluaciones...",
  "/admin/task-reviews": "Cargando revisión de actividades...",
  "/admin/official-projects": "Cargando proyectos oficiales...",
};

function getLoadingMessage(pathname: string): string {
  // Buscar coincidencia exacta primero
  if (routeMessages[pathname]) {
    return routeMessages[pathname];
  }
  
  // Buscar coincidencia parcial para rutas con parámetros
  for (const route of Object.keys(routeMessages)) {
    if (pathname.startsWith(route)) {
      return routeMessages[route];
    }
  }
  
  return "Verificando sesión...";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const { role: userRole, activeRole, isSuperAdmin, isLoading: roleLoading } = useUserRole();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    },
    enabled: !!user,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  if (loading || profileLoading || roleLoading) {
    return <LoadingScreen message={getLoadingMessage(location.pathname)} />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins and superadmins bypass approval check
  const hasAdminAccess = userRole === "admin" || isSuperAdmin;
  
  // Only check approval for non-admin users
  if (!hasAdminAccess && profile && !profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold mb-2">Cuenta Pendiente de Aprobación</h2>
          <p className="text-muted-foreground">
            Tu cuenta está siendo revisada por un administrador. Te notificaremos cuando sea aprobada.
          </p>
          <Button 
            onClick={signOut}
            variant="outline"
            className="mt-4"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Check role-based access for protected routes
  if (requiredRole) {
    const hasAccess = 
      isSuperAdmin || // superadmin has access to everything
      userRole === requiredRole || 
      userRole === 'admin' ||
      (isSuperAdmin && activeRole === requiredRole);
    
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}