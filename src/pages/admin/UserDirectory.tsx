import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Mail, Phone, FileText, Trash2, Eye, Filter, Clock, ChevronLeft, ChevronRight, Globe, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSignedUrl } from "@/hooks/useSignedUrl";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";

const ITEMS_PER_PAGE = 5;

interface ProfileContact {
  email: string | null;
  phone: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  researcher_code: string | null;
  bio: string | null;
  cv_url: string | null;
  is_approved: boolean;
  created_at: string;
  research_role: string | null;
  last_login_at: string | null;
  orcid: string | null;
  country_code: string | null;
  contact?: ProfileContact | null;
}

const RESEARCH_ROLES = [
  'Director de proyecto',
  'Investigador principal',
  'Investigador asociado',
  'Investigador',
  'Estudiante Investigador',
  'Personal técnico'
];

export default function UserDirectory() {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch contacts for all users (admin has access)
      const { data: contactsData } = await supabase
        .from("profile_contacts")
        .select("user_id, email, phone");

      // Merge contacts into profiles
      const usersWithContacts = profilesData?.map(profile => ({
        ...profile,
        contact: contactsData?.find(c => c.user_id === profile.id) || null
      })) || [];

      return usersWithContacts as Profile[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ research_role: role })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Rol actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar rol");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Usuario eliminado correctamente");
      setUserToDelete(null);
    },
    onError: () => {
      toast.error("Error al eliminar usuario");
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users?.filter((user) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "none") return !user.research_role;
    return user.research_role === roleFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Directorio de Usuarios</h1>
        <p className="text-muted-foreground mt-2">
          Vista completa de todos los usuarios registrados en el sistema
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Label>Filtrar por Rol:</Label>
            <Select value={roleFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="none">Sin rol asignado</SelectItem>
                {RESEARCH_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} usuarios mostrados {roleFilter !== "all" && `(de ${users?.length || 0} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedUsers && paginatedUsers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Rol de Investigación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-lg" title={getCountryName(user.country_code)}>
                            {getCountryFlag(user.country_code)}
                          </span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {getCountryName(user.country_code)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                        {user.researcher_code || "N/A"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={user.research_role || "none"}
                          onValueChange={(value) =>
                            updateRoleMutation.mutate({ userId: user.id, role: value === "none" ? "" : value })
                          }
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Sin rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin rol</SelectItem>
                            {RESEARCH_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                        {user.is_approved ? (
                          <Badge className="bg-primary">Aprobado</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell onClick={() => setSelectedUser(user)} className="cursor-pointer">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {user.last_login_at 
                            ? format(new Date(user.last_login_at), "dd/MM/yyyy HH:mm", { locale: es })
                            : "Nunca"
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers?.length || 0)} de {filteredUsers?.length || 0} usuarios
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>Información completa del perfil</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  {selectedUser.is_approved ? (
                    <Badge className="bg-primary">Aprobado</Badge>
                  ) : (
                    <Badge variant="secondary">Pendiente</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedUser.contact?.email || selectedUser.id}</span>
                </div>

                {selectedUser.contact?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="font-medium">{selectedUser.contact.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">País:</span>
                  <span className="font-medium flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(selectedUser.country_code)}</span>
                    {getCountryName(selectedUser.country_code)}
                  </span>
                </div>

                {selectedUser.researcher_code && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Código Investigador:</span>
                    <span className="font-medium">{selectedUser.researcher_code}</span>
                  </div>
                )}

                {selectedUser.orcid && (
                  <div className="flex items-center gap-2 text-sm">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ORCID:</span>
                    <a 
                      href={`https://orcid.org/${selectedUser.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline font-mono"
                    >
                      {selectedUser.orcid}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Último acceso:</span>
                  <span className="font-medium">
                    {selectedUser.last_login_at 
                      ? format(new Date(selectedUser.last_login_at), "dd 'de' MMMM yyyy, HH:mm", { locale: es })
                      : "Nunca ha iniciado sesión"
                    }
                  </span>
                </div>

                {selectedUser.bio && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground mb-1">Biografía:</p>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.cv_url && (
                  <div className="border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const url = await getSignedUrl('cvs', selectedUser.cv_url!);
                        if (url) {
                          window.open(url, '_blank');
                        } else {
                          toast.error('Error al abrir el CV');
                        }
                      }}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver CV
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter className="border-t pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setUserToDelete(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Usuario
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el perfil de{" "}
              <span className="font-semibold">{userToDelete?.full_name}</span> y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
