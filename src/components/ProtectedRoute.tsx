import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'researcher' | 'student';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();

  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }
      return data?.role;
    },
    enabled: !!user,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

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
    return <LoadingScreen message="Verificando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins bypass approval check
  const isAdmin = userRole === "admin";
  
  // Only check approval for non-admin users
  if (!isAdmin && profile && !profile.is_approved) {
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
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}