import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Eye, Filter, ChevronLeft, ChevronRight, Globe, Link as LinkIcon, Download, Mail, CreditCard, BadgeCheck, User } from "lucide-react";
import { getSignedUrl } from "@/hooks/useSignedUrl";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";

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
  cedula: string | null;
}

interface ProfileWithEmail extends Profile {
  email?: string | null;
}

const MEMBERSHIP_ROLES = [
  'COORDINADOR GISICF',
  'MIEMBRO',
  'INVITADO'
];

export default function ResearcherDirectory() {
  const [selectedUser, setSelectedUser] = useState<ProfileWithEmail | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: users, isLoading } = useQuery({
    queryKey: ["researchers-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, researcher_code, bio, cv_url, is_approved, research_role, orcid, country_code, cedula")
        .eq("is_approved", true)
        .order("full_name", { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch email for the selected user
  const { data: selectedUserEmail } = useQuery({
    queryKey: ["researcher-email", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null;
      const { data } = await supabase
        .from("profile_contacts")
        .select("email")
        .eq("user_id", selectedUser.id)
        .maybeSingle();
      return data?.email || null;
    },
    enabled: !!selectedUser?.id,
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
                {MEMBERSHIP_ROLES.map((role) => (
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
                     <TableHead>ORCID</TableHead>
                     <TableHead>Rol GISICF</TableHead>
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
                      <TableCell>
                        <span className="font-mono text-sm">{user.researcher_code || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        {user.orcid ? (
                          <a
                            href={`https://orcid.org/${user.orcid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-primary hover:underline"
                          >
                            {user.orcid}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
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

      {/* Enhanced Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
              {/* Hero Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden"
              >
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="hex-modal" width="28" height="49" patternUnits="userSpaceOnUse">
                    <path d="M14 0L28 12.25V36.75L14 49L0 36.75V12.25Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#hex-modal)" />
                </svg>

                <div className="relative px-6 pt-8 pb-6 flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full scale-125" />
                    <Avatar className="w-20 h-20 ring-4 ring-primary/50 relative shadow-xl">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
                        {getInitials(selectedUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold truncate">{selectedUser.full_name}</h3>
                      <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
                      {selectedUser.country_code && (
                        <span className="text-lg">{getCountryFlag(selectedUser.country_code)}</span>
                      )}
                    </div>
                    {selectedUser.research_role && (
                      <Badge className="mt-1 bg-primary/20 text-primary border-primary/30">{selectedUser.research_role}</Badge>
                    )}
                    {selectedUser.researcher_code && (
                      <p className="text-xs text-primary/70 font-mono mt-1">Código: {selectedUser.researcher_code}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Details Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="px-6 pb-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Country */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Globe className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">País</p>
                      <p className="text-sm font-medium truncate flex items-center gap-1.5">
                        <span className="text-base">{getCountryFlag(selectedUser.country_code)}</span>
                        {getCountryName(selectedUser.country_code)}
                      </p>
                    </div>
                  </div>

                  {/* Cédula */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <CreditCard className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Cédula</p>
                      <p className="text-sm font-medium font-mono truncate">
                        {selectedUser.cedula || <span className="text-muted-foreground italic">No registrada</span>}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Correo</p>
                      <p className="text-sm font-medium truncate">
                        {selectedUserEmail || <span className="text-muted-foreground italic">No disponible</span>}
                      </p>
                    </div>
                  </div>

                  {/* ORCID */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">ORCID</p>
                      {selectedUser.orcid ? (
                        <a
                          href={`https://orcid.org/${selectedUser.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline font-mono truncate block"
                        >
                          {selectedUser.orcid}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No registrado</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedUser.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Biografía</p>
                      <p className="text-sm leading-relaxed">{selectedUser.bio}</p>
                    </div>
                  </>
                )}

                {/* CV Download */}
                {selectedUser.cv_url && (
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
                    Descargar Curriculum Vitae
                  </Button>
                )}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
