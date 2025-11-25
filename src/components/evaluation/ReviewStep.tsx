import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EvaluationItem {
  category: string;
  indicator_name: string;
  score_obtained: number;
  evidence_url?: string;
  quantity?: number;
  justification?: string;
}

interface ReviewStepProps {
  items: EvaluationItem[];
  totalScore: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CATEGORY_NAMES = {
  A: "Publicación y Difusión",
  B: "Transferencia",
  C: "Recursos Económicos",
  D: "Impactos",
};

const CATEGORY_MAX_SCORES = {
  A: 45,
  B: 10,
  C: 15,
  D: 30,
};

export default function ReviewStep({ items, totalScore, onSubmit, isSubmitting }: ReviewStepProps) {
  const getCategoryScore = (category: string) => {
    return items
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.score_obtained, 0);
  };

  const categories = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Revisión y Envío</h2>
        <p className="text-muted-foreground">
          Revise su evaluación antes de enviar el informe final
        </p>
      </div>

      {/* Summary by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const score = getCategoryScore(category);
          const maxScore = CATEGORY_MAX_SCORES[category as keyof typeof CATEGORY_MAX_SCORES];
          const percentage = (score / maxScore) * 100;

          return (
            <Card key={category} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sección {category}: {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold text-foreground">{score}</span>
                    <span className="text-muted-foreground ml-1">/ {maxScore} pts</span>
                  </div>
                  <Badge
                    variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "outline"}
                  >
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Puntuación Total</p>
            <p className="text-6xl font-bold text-primary mb-2">{totalScore}</p>
            <p className="text-2xl text-muted-foreground">/ 100 puntos</p>
            <div className="mt-4">
              <Badge
                variant={totalScore >= 80 ? "default" : totalScore >= 50 ? "secondary" : "outline"}
                className="text-lg px-4 py-1"
              >
                {totalScore >= 80
                  ? "Excelente"
                  : totalScore >= 50
                  ? "Bueno"
                  : "Necesita Mejorar"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Indicadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-center">Puntos</TableHead>
                  <TableHead className="text-center">Evidencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay items registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell>{item.indicator_name}</TableCell>
                      <TableCell className="text-center">
                        {item.category === "D" ? "-" : item.quantity || 0}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-primary">
                        {item.score_obtained}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.evidence_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.evidence_url, "_blank")}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">Sin evidencia</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card className="border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Al enviar, su evaluación será sometida para revisión por el equipo administrativo.
              <br />
              No podrá realizar cambios después del envío.
            </p>
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting || items.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Evaluación Final"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
