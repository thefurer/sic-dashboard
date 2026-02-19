import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Greeting {
  id: string;
  message: string;
  from_user_id: string;
  created_at: string;
  from_name?: string;
}

export function GreetingBanner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: greetings } = useQuery({
    queryKey: ["user-greetings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_greetings" as any)
        .select("id, message, from_user_id, created_at")
        .eq("to_user_id", user!.id)
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch sender names
      const fromIds = [...new Set((data as any[]).map((g: any) => g.from_user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", fromIds);

      return (data as any[]).map((g: any) => ({
        ...g,
        from_name: profiles?.find((p) => p.id === g.from_user_id)?.full_name || "Administrador",
      })) as Greeting[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const dismissMutation = useMutation({
    mutationFn: async (greetingId: string) => {
      const { error } = await supabase
        .from("user_greetings" as any)
        .update({ read_at: new Date().toISOString() } as any)
        .eq("id", greetingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-greetings"] });
    },
  });

  if (!greetings || greetings.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {greetings.map((greeting) => (
          <motion.div
            key={greeting.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-full bg-primary/20 p-2">
                <PartyPopper className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  👋 Saludo de {greeting.from_name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 italic">
                  "{greeting.message}"
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-7 w-7 rounded-full hover:bg-destructive/10"
                onClick={() => dismissMutation.mutate(greeting.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
