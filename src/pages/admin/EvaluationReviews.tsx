import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ReviewModal } from "@/components/evaluation/ReviewModal";
import { toast } from "sonner";
import { generateGlobalEvaluationReport } from "@/lib/globalEvaluationReportGenerator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "🔴 Pendiente" },
  needs_correction: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "🟡 Corrección Requerida" },
  approved: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "🟢 Aprobado" },
};

export default function EvaluationReviews() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [reviewingReport, setReviewingReport] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed">("all");
  const queryClient = useQueryClient();

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ["evaluation-reports", selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_reports")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq("year", parseInt(selectedYear))
        .in("status", ["submitted", "needs_correction", "approved"])
        .order("submitted_at", { ascending: sortBy === "oldest" });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (reportId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta evaluación? Esto también eliminará todos los ítems asociados.")) return;

    try {
      const { error } = await supabase
        .from("evaluation_reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;
      
      toast.success("Evaluación eliminada exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      await queryClient.refetchQueries({ queryKey: ["evaluation-reports"] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Error al eliminar", { 
        description: error.message || "No se pudo eliminar la evaluación" 
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!reports || reports.length === 0) {
      toast.error("No hay evaluaciones para eliminar");
      return;
    }

    const confirmText = `¿Estás seguro de eliminar TODAS las ${reports.length} evaluaciones del año ${selectedYear}? Esta acción no se puede deshacer.`;
    if (!window.confirm(confirmText)) return;

    // Second confirmation for safety
    if (!window.confirm("⚠️ CONFIRMACIÓN FINAL: ¿Realmente deseas eliminar todas las evaluaciones?")) return;

    try {
      toast.loading("Eliminando todas las evaluaciones...");
      
      const { error } = await supabase
        .from("evaluation_reports")
        .delete()
        .eq("year", parseInt(selectedYear));

      if (error) throw error;
      
      toast.dismiss();
      toast.success(`${reports.length} evaluaciones eliminadas exitosamente`);
      await queryClient.invalidateQueries({ queryKey: ["evaluation-reports"] });
      await queryClient.refetchQueries({ queryKey: ["evaluation-reports"] });
    } catch (error: any) {
      toast.dismiss();
      console.error("Delete all error:", error);
      toast.error("Error al eliminar", { 
        description: error.message || "No se pudieron eliminar las evaluaciones" 
      });
    }
  };

  const handleGenerateGlobalReport = async () => {
    try {
      const approvedReports = reports?.filter(r => r.status === 'approved') || [];
      
      if (approvedReports.length === 0) {
        toast.error("No hay evaluaciones aprobadas para generar el informe");
        return;
      }

      toast.loading("Generando informe global...");
      await generateGlobalEvaluationReport(approvedReports, parseInt(selectedYear));
      toast.dismiss();
      toast.success("Informe global generado exitosamente");
    } catch (error: any) {
      console.error("Global report error:", error);
      toast.dismiss();
      toast.error("Error al generar informe", {
        description: error.message || "No se pudo generar el informe"
      });
    }
  };

  // Filter by search term and status
  const filteredReports = reports?.filter((report) => {
    const userName = (report.profiles as any)?.full_name?.toLowerCase() || "";
    const matchesSearch = userName.includes(searchTerm.toLowerCase());
    
    if (statusFilter === "pending") {
      return matchesSearch && report.status === "submitted";
    } else if (statusFilter === "reviewed") {
      return matchesSearch && (report.status === "approved" || report.status === "needs_correction");
    }
    return matchesSearch;
  });

  // Calculate counts for tabs
  const pendingCount = reports?.filter(r => r.status === "submitted").length || 0;
  const reviewedCount = reports?.filter(r => r.status === "approved" || r.status === "needs_correction").length || 0;

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Revisión de Evaluaciones</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba las evaluaciones anuales enviadas por los investigadores
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={!reports || reports.length === 0}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Todo
          </Button>
          <Button
            onClick={handleGenerateGlobalReport}
            size="lg"
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Generar Informe General (PDF)
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Status Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Clock className="w-4 h-4" />
              Todos ({reports?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              Pendientes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Revisados ({reviewedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  Año {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Cargando evaluaciones...</p>
          </div>
        ) : filteredReports && filteredReports.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investigador</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Envío</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const statusConfig = STATUS_COLORS[report.status] || STATUS_COLORS.submitted;
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {(report.profiles as any)?.full_name || "Sin nombre"}
                      </TableCell>
                      <TableCell>{report.year}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{report.total_score}/100</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.submitted_at
                          ? new Date(report.submitted_at).toLocaleDateString("es-ES")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReviewingReport(report)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay evaluaciones enviadas para este año</p>
          </div>
        )}
      </Card>

      {reviewingReport && (
        <ReviewModal
          open={!!reviewingReport}
          onOpenChange={(open) => !open && setReviewingReport(null)}
          report={reviewingReport}
          userName={(reviewingReport.profiles as any)?.full_name || "Sin nombre"}
        />
      )}
    </div>
  );
}
