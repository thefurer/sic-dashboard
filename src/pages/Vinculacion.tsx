import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockFunding = [
  {
    id: 1,
    title: "Convocatoria SENESCYT 2024",
    amount: "$50,000",
    status: "approved" as const,
    deadline: "2024-12-31",
  },
  {
    id: 2,
    title: "Fondos de Investigación Provincial",
    amount: "$25,000",
    status: "pending" as const,
    deadline: "2024-11-15",
  },
  {
    id: 3,
    title: "Programa de Innovación Tecnológica",
    amount: "$75,000",
    status: "applied" as const,
    deadline: "2024-10-30",
  },
];

const mockEvidences = [
  {
    id: 1,
    title: "Taller de Capacitación - Comunidad San Pedro",
    type: "image",
    date: "2024-05-15",
  },
  {
    id: 2,
    title: "Informe Técnico - Proyecto Agricultura",
    type: "document",
    date: "2024-04-20",
  },
  {
    id: 3,
    title: "Video Testimonial - Beneficiarios",
    type: "video",
    date: "2024-03-10",
  },
];

export default function Vinculacion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vinculación con la Sociedad</h1>
        <p className="text-muted-foreground">
          Proyectos de extensión y gestión de financiamiento
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Convocatorias y Financiamiento</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Convocatoria
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Convocatoria</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFunding.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Cierre: {new Date(item.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evidencias de Vinculación</CardTitle>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Subir Evidencia
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEvidences.map((evidence) => (
                <div
                  key={evidence.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{evidence.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evidence.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-secondary rounded-md capitalize">
                      {evidence.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
