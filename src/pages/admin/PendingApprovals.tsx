import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { sendNotificationEmail } from "@/hooks/useSendEmail";

export default function PendingApprovals() {
  const queryClient = useQueryClient();

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      
      // Fetch contacts for pending users (admin has access)
      const userIds = profilesData?.map(p => p.id) || [];
      const { data: contactsData } = await supabase
        .from("profile_contacts")
        .select("user_id, email")
        .in("user_id", userIds);
      
      // Merge contacts into profiles
      return profilesData?.map(profile => ({
        ...profile,
        email: contactsData?.find(c => c.user_id === profile.id)?.email || null
      })) || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, email, fullName }: { userId: string; email: string | null; fullName: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;
      
      // Send welcome email with invitation to update profile
      if (email) {
        await sendNotificationEmail({
          type: "user_approved",
          to: email,
          userName: fullName || "Usuario",
          data: {},
        }).catch(err => console.error("Error sending approval email:", err));
      }
      
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals-count"] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Usuario aprobado correctamente. Se ha enviado un email de bienvenida.");
    },
    onError: () => {
      toast.error("Error al aprobar usuario");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke("reject-user", {
        body: { userId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals-count"] });
      toast.success("Solicitud rechazada");
    },
    onError: () => {
      toast.error("Error al rechazar solicitud");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Solicitudes Pendientes</h1>
        <p className="text-muted-foreground mt-2">
          Revisa y aprueba nuevos usuarios que han solicitado acceso al sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Pendientes de Aprobación</CardTitle>
          <CardDescription>
            {pendingUsers?.length || 0} solicitudes esperando aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingUsers && pendingUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Código Investigador</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email || user.full_name}</TableCell>
                    <TableCell>{user.researcher_code || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => approveMutation.mutate({ 
                            userId: user.id, 
                            email: user.email,
                            fullName: user.full_name 
                          })}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(user.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay solicitudes pendientes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
