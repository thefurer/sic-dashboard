import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState, useCallback, useMemo } from "react";

type AppRole = "superadmin" | "admin" | "researcher" | "student";
type ActiveRole = "admin" | "researcher";

export function useUserRole() {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<ActiveRole>("admin");

  const query = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return (data?.role as AppRole) ?? null;
    },
    enabled: !!user,
    retry: 1,
  });

  const role = query.data;
  const isSuperAdmin = role === "superadmin";

  const switchRole = useCallback(() => {
    setActiveRole((prev) => (prev === "admin" ? "researcher" : "admin"));
  }, []);

  const effectiveRole = useMemo(() => {
    if (isSuperAdmin) return activeRole;
    if (role === "admin") return "admin";
    return role || "researcher";
  }, [isSuperAdmin, activeRole, role]);

  return {
    ...query,
    data: role,
    role,
    activeRole: effectiveRole as ActiveRole,
    isSuperAdmin,
    switchRole,
    isAdmin: effectiveRole === "admin" || isSuperAdmin,
  };
}
