import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, AlertCircle, ExternalLink, FileText, Users, BookOpen, Building, DollarSign, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { openSignedUrl } from "@/hooks/useSignedUrl";
import { sendNotificationEmail, getUserEmail } from "@/hooks/useSendEmail";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: {
    id: string;
    year: number;
    total_score: number;
    user_id: string;
    status: string;
  };
  userName: string;
}

// Types for evidence_details structures
interface ProjectEntry {
  id?: string;
  related_project_id?: string;
  proposal_type?: string;
  team_members?: string[];
  project_roles?: { director?: string; principal?: string };
  evidences?: Array<{ url: string; description: string }>;
}

interface ArticleEntry {
  id?: string;
  project_type?: string;
  metadata?: {
    title?: string;
    authors?: string;
    journal?: string;
    year?: string;
    issn?: string;
    doi?: string;
    quartile?: string;
    repository?: string;
    editorial?: string;
    isbn?: string;
    link?: string;
  };
  files?: {
    producto?: { url: string; name: string };
    pares?: { url: string; name: string };
    aceptacion?: { url: string; name: string };
    publicacion?: { url: string; name: string };
  };
}

interface ConvocatoriaEntry {
  id?: string;
  entity_name?: string;
  entity_type?: string;
  description?: string;
  amount?: number;
  related_project_id?: string;
  evidences?: Array<{ url: string; description: string }>;
}

interface VinculacionEntry {
  id?: string;
  project_name?: string;
  description?: string;
  related_project_id?: string;
  evidences?: Array<{ url: string; description: string }>;
}

export function ReviewModal({ open, onOpenChange, report, userName }: ReviewModalProps) {
  const [observations, setObservations] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const queryClient = useQueryClient();

  // Fetch evaluation items with full metadata
  const { data: evaluationItems } = useQuery({
    queryKey: ["evaluation-items", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_items")
        .select(`
          *,
          related_project:official_projects(name)
        `)
        .eq("report_id", report.id)
        .order("category", { ascending: true });

      if (error) throw error;
      
      // Deduplicate Section D items by indicator_name
      const items = data || [];
      const uniqueItems = new Map();
      
      items.forEach(item => {
        if (item.category === 'D') {
          const key = item.indicator_name;
          if (!uniqueItems.has(key)) {
            uniqueItems.set(key, item);
          }
        } else {
          uniqueItems.set(item.id, item);
        }
      });
      
      return Array.from(uniqueItems.values());
    },
    enabled: open,
  });

  // Fetch official projects for name resolution
  const { data: officialProjects } = useQuery({
    queryKey: ["official-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("official_projects")
        .select("id, name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch team member profiles for displaying names
  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-evaluation", report.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const getProfileName = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.full_name || "Usuario desconocido";
  };

  const getProjectName = (projectId: string) => {
    const project = officialProjects?.find(p => p.id === projectId);
    return project?.name || "Proyecto no encontrado";
  };

  const handleOpenEvidence = async (filePath: string) => {
    if (!filePath) {
      toast.error("Ruta de archivo no encontrada");
      return;
    }
    
    // Check if it's already a full URL (legacy data)
    if (filePath.startsWith('http')) {
      // For legacy public URLs, try to extract the path and get signed URL
      await openSignedUrl('evaluation-evidence', filePath);
      return;
    }
    
    // Get signed URL for private bucket
    await openSignedUrl('evaluation-evidence', filePath);
  };

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("evaluation_reports")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_observations: null,
          correction_deadline: null,
        })
        .eq("id", report.id);

      if (error) throw error;

      // Send email notification
      const email = await getUserEmail(report.user_id);
      if (email) {
        sendNotificationEmail({
          type: "evaluation_approved",
          to: email,
          userName,
          data: {
            evaluationYear: report.year,
            score: report.total_score,
          },
        }).catch(err => console.error("Error sending notification:", err));
      }
    },
    onSuccess: () => {
      toast.success("Evaluación aprobada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error al aprobar", { description: error.message });
    },
  });

  const observeMutation = useMutation({
    mutationFn: async () => {
      if (!observations.trim()) {
        throw new Error("Las observaciones son obligatorias");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("evaluation_reports")
        .update({
          status: "needs_correction",
          admin_observations: observations,
          correction_deadline: deadline?.toISOString().split('T')[0] || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", report.id);

      if (error) throw error;

      // Send email notification
      const email = await getUserEmail(report.user_id);
      if (email) {
        sendNotificationEmail({
          type: "evaluation_correction",
          to: email,
          userName,
          data: {
            evaluationYear: report.year,
            observations: observations,
            correctionDeadline: deadline?.toISOString().split('T')[0],
          },
        }).catch(err => console.error("Error sending notification:", err));
      }
    },
    onSuccess: () => {
      toast.success("Observaciones enviadas exitosamente");
      queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      onOpenChange(false);
      setObservations("");
      setDeadline(undefined);
    },
    onError: (error) => {
      toast.error("Error al enviar observaciones", { description: error.message });
    },
  });

  const handleApprove = () => {
    if (window.confirm(`¿Estás seguro de aprobar la evaluación de ${userName}?`)) {
      approveMutation.mutate();
    }
  };

  const handleObserve = () => {
    observeMutation.mutate();
  };

  // Render project entries (Proyectos I+D+i)
  const renderProjectEntries = (entries: ProjectEntry[], relatedProject: any) => {
    if (!entries || entries.length === 0) {
      return <p className="text-xs text-muted-foreground italic">Sin proyectos registrados</p>;
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="p-3 bg-muted/30 rounded-lg border space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Proyecto {idx + 1}</span>
              {entry.proposal_type && (
                <Badge variant="secondary" className="text-xs">{entry.proposal_type}</Badge>
              )}
            </div>
            
            {entry.related_project_id && (
              <p className="text-xs"><strong>Proyecto Oficial:</strong> {getProjectName(entry.related_project_id)}</p>
            )}
            
            {entry.project_roles && (
              <div className="text-xs space-y-1 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3" />
                  <strong>Roles del Proyecto:</strong>
                </div>
                {entry.project_roles.director && (
                  <p>• Director: {getProfileName(entry.project_roles.director)}</p>
                )}
                {entry.project_roles.principal && (
                  <p>• Investigador Principal: {getProfileName(entry.project_roles.principal)}</p>
                )}
              </div>
            )}
            
            {entry.team_members && entry.team_members.length > 0 && (
              <div className="text-xs p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <strong>Equipo Investigador:</strong>
                <p>{entry.team_members.map(id => getProfileName(id)).join(', ')}</p>
              </div>
            )}
            
            {entry.evidences && entry.evidences.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-semibold">Evidencias ({entry.evidences.length}):</p>
                {entry.evidences.map((ev, evIdx) => (
                  <div key={evIdx} className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="flex-1 truncate">{ev.description || `Documento ${evIdx + 1}`}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(ev.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Verification handlers for admin
  const handleVerifyDOI = (doi: string) => {
    if (!doi) {
      toast.error("DOI no disponible");
      return;
    }
    window.open(`https://doi.org/${doi}`, "_blank");
  };

  const handleVerifyISBN = (isbn: string) => {
    if (!isbn) {
      toast.error("ISBN no disponible");
      return;
    }
    window.open(`https://www.google.com/search?q=ISBN+${encodeURIComponent(isbn)}`, "_blank");
  };

  const handleVerifyMIAR = (issn: string) => {
    if (!issn) {
      toast.error("ISSN no disponible");
      return;
    }
    window.open(`https://miar.ub.edu/issn/${issn}`, "_blank");
  };

  const handleVerifyScimago = (issn: string) => {
    if (!issn) {
      toast.error("ISSN no disponible");
      return;
    }
    window.open(`https://www.scimagojr.com/journalsearch.php?q=${issn}`, "_blank");
  };

  // Render article/book/ponencia entries
  const renderArticleEntries = (entries: ArticleEntry[], indicatorName: string) => {
    if (!entries || entries.length === 0) {
      return <p className="text-xs text-muted-foreground italic">Sin entradas registradas</p>;
    }

    const isRegionalArticle = indicatorName === "Artículos Regionales";
    const isJCRArticle = indicatorName.includes("JCR") || indicatorName.includes("Scopus");
    const isBook = indicatorName === "Libros Científicos";

    return (
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="p-3 bg-muted/30 rounded-lg border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{entry.metadata?.title || `Entrada ${idx + 1}`}</span>
              {entry.project_type && (
                <Badge variant="outline" className="text-xs">{entry.project_type}</Badge>
              )}
            </div>
            
            {entry.metadata && (
              <div className="text-xs space-y-1 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                {entry.metadata.authors && <p><strong>Autores:</strong> {entry.metadata.authors}</p>}
                {entry.metadata.journal && <p><strong>Revista:</strong> {entry.metadata.journal}</p>}
                {entry.metadata.editorial && <p><strong>Editorial:</strong> {entry.metadata.editorial}</p>}
                {entry.metadata.year && <p><strong>Año:</strong> {entry.metadata.year}</p>}
                {entry.metadata.issn && <p><strong>ISSN:</strong> {entry.metadata.issn}</p>}
                {entry.metadata.isbn && <p><strong>ISBN:</strong> {entry.metadata.isbn}</p>}
                {entry.metadata.doi && <p className="break-all"><strong>DOI:</strong> {entry.metadata.doi}</p>}
                {entry.metadata.repository && <p><strong>Indizado en:</strong> {entry.metadata.repository}</p>}
                {entry.metadata.quartile && <p><strong>Cuartil:</strong> {entry.metadata.quartile}</p>}
                {entry.metadata.link && (
                  <p className="break-all">
                    <strong>Enlace:</strong>{' '}
                    <a href={entry.metadata.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {entry.metadata.link}
                    </a>
                  </p>
                )}
              </div>
            )}
            
            {/* Verification buttons for admin - Smart Search */}
            <div className="flex flex-wrap gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
              <span className="w-full text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                Verificación Inteligente:
              </span>
              
              {/* JCR/Scopus Articles */}
              {isJCRArticle && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      const doi = entry.metadata?.doi;
                      if (doi) {
                        handleVerifyDOI(doi);
                      } else {
                        // Search by title if no DOI
                        const title = entry.metadata?.title;
                        if (title) {
                          window.open(`https://www.crossref.org/guestquery?queryType=1&search_type=article&auth2=&atitle2=${encodeURIComponent(title)}`, "_blank");
                        } else {
                          toast.error("No hay DOI ni título para buscar");
                        }
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {entry.metadata?.doi ? "Verificar DOI" : "Buscar en Crossref"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      const issn = entry.metadata?.issn;
                      const journal = entry.metadata?.journal;
                      if (issn) {
                        handleVerifyScimago(issn);
                      } else if (journal) {
                        window.open(`https://www.scimagojr.com/journalsearch.php?q=${encodeURIComponent(journal)}`, "_blank");
                      } else {
                        toast.error("No hay ISSN ni revista para buscar");
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Verificar Scimago
                  </Button>
                </>
              )}
              
              {/* Regional Articles - MIAR */}
              {isRegionalArticle && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 border-amber-500 text-amber-600 hover:bg-amber-50"
                  onClick={() => {
                    const issn = entry.metadata?.issn;
                    const journal = entry.metadata?.journal;
                    if (issn) {
                      handleVerifyMIAR(issn);
                    } else if (journal) {
                      window.open(`https://miar.ub.edu/search?q=${encodeURIComponent(journal)}`, "_blank");
                    } else {
                      toast.error("No hay ISSN ni revista para buscar en MIAR");
                    }
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  {entry.metadata?.issn ? "Verificar en MIAR" : "Buscar en MIAR"}
                </Button>
              )}
              
              {/* Books - ISBN */}
              {isBook && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    const isbn = entry.metadata?.isbn;
                    const title = entry.metadata?.title;
                    if (isbn) {
                      handleVerifyISBN(isbn);
                    } else if (title) {
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(title)}+libro`, "_blank");
                    } else {
                      toast.error("No hay ISBN ni título para buscar");
                    }
                  }}
                >
                  <BookOpen className="w-3 h-3" />
                  {entry.metadata?.isbn ? "Verificar ISBN" : "Buscar Libro"}
                </Button>
              )}
            </div>
            
            {entry.files && Object.keys(entry.files).length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-semibold">Archivos de Evidencia:</p>
                {entry.files.producto && (
                  <div className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-green-600" />
                    <span className="flex-1">Producto Publicado: {entry.files.producto.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(entry.files!.producto!.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                )}
                {entry.files.pares && (
                  <div className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span className="flex-1">Evaluación por Pares: {entry.files.pares.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(entry.files!.pares!.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                )}
                {entry.files.aceptacion && (
                  <div className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-amber-600" />
                    <span className="flex-1">Certificado Aceptación: {entry.files.aceptacion.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(entry.files!.aceptacion!.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                )}
                {entry.files.publicacion && (
                  <div className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-purple-600" />
                    <span className="flex-1">Certificado Publicación: {entry.files.publicacion.name}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(entry.files!.publicacion!.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render convocatoria entries
  const renderConvocatoriaEntries = (entries: ConvocatoriaEntry[]) => {
    if (!entries || entries.length === 0) {
      return <p className="text-xs text-muted-foreground italic">Sin convocatorias registradas</p>;
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="p-3 bg-muted/30 rounded-lg border space-y-2">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-sm">{entry.entity_name || `Convocatoria ${idx + 1}`}</span>
              {entry.entity_type && (
                <Badge variant="secondary" className="text-xs">
                  {entry.entity_type === 'interna' ? 'Entidad Interna' : 'ONG/Externa'}
                </Badge>
              )}
            </div>
            
            {entry.description && (
              <p className="text-xs text-muted-foreground">{entry.description}</p>
            )}
            
            {entry.amount !== undefined && entry.amount !== null && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                <DollarSign className="w-4 h-4 text-green-600" />
                <strong>Monto Asignado:</strong>
                <span className="font-bold text-green-700 dark:text-green-400">
                  ${Number(entry.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            )}
            
            {entry.related_project_id && (
              <p className="text-xs"><strong>Proyecto Vinculado:</strong> {getProjectName(entry.related_project_id)}</p>
            )}
            
            {entry.evidences && entry.evidences.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-semibold">Evidencias ({entry.evidences.length}):</p>
                {entry.evidences.map((ev, evIdx) => (
                  <div key={evIdx} className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="flex-1 truncate">{ev.description || `Documento ${evIdx + 1}`}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(ev.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render vinculacion entries
  const renderVinculacionEntries = (entries: VinculacionEntry[]) => {
    if (!entries || entries.length === 0) {
      return <p className="text-xs text-muted-foreground italic">Sin proyectos de vinculación registrados</p>;
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="p-3 bg-muted/30 rounded-lg border space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-sm">{entry.project_name || `Proyecto ${idx + 1}`}</span>
            </div>
            
            {entry.description && (
              <p className="text-xs text-muted-foreground">{entry.description}</p>
            )}
            
            {entry.related_project_id && (
              <p className="text-xs"><strong>Proyecto Oficial:</strong> {getProjectName(entry.related_project_id)}</p>
            )}
            
            {entry.evidences && entry.evidences.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-xs font-semibold">Evidencias ({entry.evidences.length}):</p>
                {entry.evidences.map((ev, evIdx) => (
                  <div key={evIdx} className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="flex-1 truncate">{ev.description || `Documento ${evIdx + 1}`}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(ev.url)}>
                      <ExternalLink className="w-3 h-3 mr-1" />Ver
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render generic evidence list (fallback)
  const renderGenericEvidences = (evidences: Array<{url: string, description: string}>) => {
    if (!evidences || evidences.length === 0) {
      return <p className="text-xs text-muted-foreground italic">Sin evidencias cargadas</p>;
    }

    return (
      <div className="space-y-2">
        {evidences.map((ev, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
            <FileText className="w-3 h-3 text-primary" />
            <span className="flex-1 truncate">{ev.description || `Documento ${idx + 1}`}</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(ev.url)}>
              <ExternalLink className="w-3 h-3 mr-1" />Ver
            </Button>
          </div>
        ))}
      </div>
    );
  };

  // Render Section D evidences (stored in evidence_url as JSON array of paths)
  const renderSectionDEvidences = (evidenceUrl: string | null | undefined) => {
    if (!evidenceUrl) {
      return <p className="text-xs text-muted-foreground italic">Sin evidencias cargadas</p>;
    }

    try {
      const evidences = JSON.parse(evidenceUrl);
      if (!Array.isArray(evidences) || evidences.length === 0) {
        return <p className="text-xs text-muted-foreground italic">Sin evidencias cargadas</p>;
      }

      // Filter out empty/null values
      const validEvidences = evidences.filter((ev: string) => ev && ev.trim() !== '');
      
      if (validEvidences.length === 0) {
        return <p className="text-xs text-muted-foreground italic">Sin evidencias cargadas</p>;
      }

      // Extract filename from path
      const getFileName = (path: string) => {
        const parts = path.split('/');
        const fullName = parts[parts.length - 1] || `Evidencia`;
        // Remove UUID/timestamp prefix if present (format: indicator_index_timestamp.pdf)
        const cleanName = fullName.replace(/_\d+\.pdf$/, '.pdf');
        return cleanName.length > 40 ? cleanName.substring(0, 37) + '...' : cleanName;
      };

      return (
        <div className="space-y-1">
          {validEvidences.map((filePath: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-1.5 bg-card border rounded text-xs">
              <FileText className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="flex-1 truncate text-muted-foreground">{getFileName(filePath)}</span>
              <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={() => handleOpenEvidence(filePath)}>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      // If parsing fails, it might be a single path string
      if (typeof evidenceUrl === 'string' && evidenceUrl.trim() !== '') {
        return (
          <div className="flex items-center gap-2 p-2 bg-card border rounded text-xs">
            <FileText className="w-3 h-3 text-primary" />
            <span className="flex-1 truncate">Evidencia</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleOpenEvidence(evidenceUrl)}>
              <ExternalLink className="w-3 h-3 mr-1" />Ver
            </Button>
          </div>
        );
      }
      return <p className="text-xs text-muted-foreground italic">Sin evidencias cargadas</p>;
    }
  };

  // Parse evidence_details based on indicator type
  const parseAndRenderEvidenceDetails = (item: any) => {
    const evidenceDetails = item.evidence_details;
    const indicatorName = item.indicator_name;
    const relatedProject = item.related_project;
    const category = item.category;

    // For Section D (Impactos), evidences are stored in evidence_url as JSON array
    if (category === 'D') {
      return renderSectionDEvidences(item.evidence_url);
    }

    // Handle null/undefined
    if (!evidenceDetails) {
      return <p className="text-xs text-muted-foreground italic">Sin datos registrados</p>;
    }

    // If it's an array, determine the type
    if (Array.isArray(evidenceDetails)) {
      // Check if it's project entries (Proyectos I+D+i)
      if (indicatorName === "Proyectos I+D+i") {
        return renderProjectEntries(evidenceDetails as ProjectEntry[], relatedProject);
      }
      
      // Check if it's article/book entries
      if (indicatorName.includes("Artículos") || indicatorName === "Libros Científicos" || indicatorName === "Ponencias") {
        return renderArticleEntries(evidenceDetails as ArticleEntry[], indicatorName);
      }
      
      // Check if it's convocatoria entries
      if (indicatorName.includes("Convocatoria") || indicatorName.includes("Financiamiento")) {
        return renderConvocatoriaEntries(evidenceDetails as ConvocatoriaEntry[]);
      }
      
      // Check if it's vinculacion entries
      if (indicatorName.includes("Vinculación")) {
        return renderVinculacionEntries(evidenceDetails as VinculacionEntry[]);
      }
      
      // Generic fallback for simple evidence arrays
      if (evidenceDetails.length > 0 && evidenceDetails[0].url) {
        return renderGenericEvidences(evidenceDetails as Array<{url: string, description: string}>);
      }
    }

    // If it's an object (legacy format), try to render what we can
    if (typeof evidenceDetails === 'object' && !Array.isArray(evidenceDetails)) {
      return (
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(evidenceDetails, null, 2)}
        </pre>
      );
    }

    return <p className="text-xs text-muted-foreground italic">Formato de datos no reconocido</p>;
  };

  // Calculate section scores
  const getSectionScore = (category: string) => {
    const sectionItems = evaluationItems?.filter(i => i.category === category) || [];
    return sectionItems.reduce((sum, item) => sum + (item.score_obtained || 0), 0);
  };

  const getMaxScore = (category: string) => {
    const maxScores: Record<string, number> = { A: 45, B: 10, C: 15, D: 30 };
    return maxScores[category] || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Evaluación - {userName}</DialogTitle>
          <DialogDescription>
            Año {report.year} • Puntuación: {report.total_score}/100 pts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold mb-2">Resumen de Puntuación</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              {['A', 'B', 'C', 'D'].map(cat => (
                <div key={cat} className="text-center p-2 bg-card rounded border">
                  <p className="text-xs text-muted-foreground">Sección {cat}</p>
                  <p className="font-bold text-lg">{getSectionScore(cat)}/{getMaxScore(cat)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-primary">100</span>
              <span className="text-muted-foreground">/100 puntos totales</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Evaluación completa
            </p>
          </div>

          {/* Detailed Evidence Review - Grouped by Category */}
          {evaluationItems && evaluationItems.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalle Completo de Evaluación ({evaluationItems.length} items)
              </h3>
              <ScrollArea className="h-[500px] pr-4">
                <Accordion type="multiple" defaultValue={["section-a", "section-b", "section-c", "section-d"]} className="space-y-4">
                  {/* Section A: Publicación */}
                  {evaluationItems.filter(i => i.category === 'A').length > 0 && (
                    <AccordionItem value="section-a" className="border rounded-lg px-4 border-blue-200 dark:border-blue-900">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">Sección A: Publicación y Difusión Científica</span>
                          <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                            {getSectionScore('A')}/45 pts
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'A').map((item) => (
                            <Card key={item.id} className="p-4 border-l-4 border-blue-500">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                <Badge className="bg-blue-600">
                                  {item.score_obtained || 0} pts
                                </Badge>
                              </div>

                              {/* Related Project (from DB join) */}
                              {item.related_project && (
                                <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
                                  <p><strong>Proyecto Vinculado:</strong> {(item.related_project as any).name}</p>
                                </div>
                              )}

                              {/* Parse and render evidence_details */}
                              <div className="mt-3">
                                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Entradas Registradas:
                                </p>
                                {parseAndRenderEvidenceDetails(item)}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Section B: Transferencia */}
                  {evaluationItems.filter(i => i.category === 'B').length > 0 && (
                    <AccordionItem value="section-b" className="border rounded-lg px-4 border-green-200 dark:border-green-900">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">Sección B: Transferencia de Tecnología</span>
                          <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                            {getSectionScore('B')}/10 pts
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'B').map((item) => (
                            <Card key={item.id} className="p-4 border-l-4 border-green-500">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                <Badge className="bg-green-600">
                                  {item.score_obtained || 0} pts
                                </Badge>
                              </div>

                              {item.related_project && (
                                <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs">
                                  <p><strong>Proyecto Vinculado:</strong> {(item.related_project as any).name}</p>
                                </div>
                              )}

                              {item.justification && (
                                <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs">
                                  <strong>Descripción:</strong>
                                  <p className="mt-1 italic">{item.justification}</p>
                                </div>
                              )}

                              <div className="mt-3">
                                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Entradas Registradas:
                                </p>
                                {parseAndRenderEvidenceDetails(item)}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Section C: Recursos */}
                  {evaluationItems.filter(i => i.category === 'C').length > 0 && (
                    <AccordionItem value="section-c" className="border rounded-lg px-4 border-purple-200 dark:border-purple-900">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-600">Sección C: Recursos Económicos</span>
                          <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">
                            {getSectionScore('C')}/15 pts
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'C').map((item) => (
                            <Card key={item.id} className="p-4 border-l-4 border-purple-500">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                <Badge className="bg-purple-600">
                                  {item.score_obtained || 0} pts
                                </Badge>
                              </div>

                              {item.monto !== undefined && item.monto !== null && item.monto > 0 && (
                                <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md text-sm flex items-center gap-2">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  <span className="font-bold text-green-700 dark:text-green-400">
                                    Monto Total: ${Number(item.monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD
                                  </span>
                                </div>
                              )}

                              {item.fase && (
                                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                                  <p><strong>Fase:</strong> <span className="capitalize">{item.fase}</span></p>
                                </div>
                              )}

                              {item.porcentaje_ejecucion !== undefined && item.porcentaje_ejecucion !== null && (
                                <div className="mb-3 p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded text-xs">
                                  <p><strong>Porcentaje de Ejecución:</strong> {item.porcentaje_ejecucion}%</p>
                                </div>
                              )}

                              <div className="mt-3">
                                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Convocatorias Registradas:
                                </p>
                                {parseAndRenderEvidenceDetails(item)}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Section D: Impactos */}
                  {evaluationItems.filter(i => i.category === 'D').length > 0 && (
                    <AccordionItem value="section-d" className="border rounded-lg px-4 border-orange-200 dark:border-orange-900">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-orange-600">Sección D: Impactos</span>
                          <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                            {getSectionScore('D')}/30 pts
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {evaluationItems.filter(i => i.category === 'D').map((item) => (
                            <Card key={item.id} className="p-4 border-l-4 border-orange-500">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-semibold text-sm">{item.indicator_name}</h4>
                                <Badge className="bg-orange-600">
                                  {item.score_obtained || 0} pts
                                </Badge>
                              </div>

                              {item.justification && (
                                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900">
                                  <p className="text-xs font-semibold mb-1">Justificación del Impacto:</p>
                                  <p className="text-sm italic whitespace-pre-wrap text-foreground/90">{item.justification}</p>
                                </div>
                              )}

                              {/* Patents specific fields */}
                              {item.indicator_name?.includes("Patente") && (
                                <>
                                  {item.monto !== undefined && item.monto > 0 && (
                                    <div className="mb-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                                      <strong>Monto:</strong> ${Number(item.monto).toLocaleString('es-ES')} USD
                                    </div>
                                  )}
                                  {item.fase && (
                                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                                      <strong>Fase:</strong> <span className="capitalize">{item.fase}</span>
                                    </div>
                                  )}
                                  {item.porcentaje_ejecucion !== undefined && (
                                    <div className="mb-2 p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded text-xs">
                                      <strong>% Ejecución:</strong> {item.porcentaje_ejecucion}%
                                    </div>
                                  )}
                                </>
                              )}

                              <div className="mt-3">
                                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Evidencias:
                                </p>
                                {parseAndRenderEvidenceDetails(item)}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </ScrollArea>
            </div>
          )}

          {/* Compact Action Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border">
            <div className="space-y-1.5">
              <Label htmlFor="observations" className="text-xs font-medium">Observaciones</Label>
              <Textarea
                id="observations"
                placeholder="Escribir observaciones o correcciones..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Fecha Límite (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left font-normal h-9",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {deadline ? format(deadline, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending || observeMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={handleObserve}
            disabled={!observations.trim() || observeMutation.isPending}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {observeMutation.isPending ? "Enviando..." : "Enviar Observaciones"}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {approveMutation.isPending ? "Aprobando..." : "Aprobar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
