import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Eye, Filter, ChevronLeft, ChevronRight, Globe, Link as LinkIcon, Download } from "lucide-react";
import { getSignedUrl } from "@/hooks/useSignedUrl";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";

const ITEMS_PER_PAGE = 5;

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  researcher_code: string | null;
  bio: string | null;
  cv_url: string | null;
  is_approved: boolean;
  research_role: string | null;
  orcid: string | null;
  country_code: string | null;
}

const RESEARCH_ROLES = [
  'Director de proyecto',
  'Investigador principal',
  'Investigador asociado',
  'Investigador',
  'Estudiante Investigador',
  'Personal técnico'
];

export default function ResearcherDirectory() {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: users, isLoading } = useQuery({
    queryKey: ["researchers-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, researcher_code, bio, cv_url, is_approved, research_role, orcid, country_code")
        .eq("is_approved", true)
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data as Profile[];
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

  const totalPages = Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Directorio de Investigadores</h1>
        <p className="text-muted-foreground mt-2">
          Conoce a los investigadores registrados en el sistema
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
          <CardTitle>Investigadores</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} investigadores {roleFilter !== "all" && `(de ${users?.length || 0} total)`}
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
                    <TableHead>Investigador</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.full_name}</span>
                            {user.country_code && (
                              <span className="text-sm" title={getCountryName(user.country_code)}>
                                {getCountryFlag(user.country_code)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.researcher_code || "N/A"}</TableCell>
                      <TableCell>
                        {user.research_role ? (
                          <Badge variant="secondary">{user.research_role}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin rol</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver perfil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers?.length || 0)} de {filteredUsers?.length || 0}
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
              No hay investigadores registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil del Investigador</DialogTitle>
            <DialogDescription>Información del perfil</DialogDescription>
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
                  {selectedUser.research_role && (
                    <Badge variant="secondary">{selectedUser.research_role}</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
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
                      className="w-full"
                      onClick={async () => {
                        try {
                          const signedUrl = await getSignedUrl('cvs', selectedUser.cv_url!);
                          if (signedUrl) {
                            window.open(signedUrl, '_blank');
                          }
                        } catch (error) {
                          console.error('Error getting CV URL:', error);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar CV
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
