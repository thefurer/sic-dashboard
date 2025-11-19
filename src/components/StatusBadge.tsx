import { Badge } from "@/components/ui/badge";

type Status = "proposed" | "in-progress" | "finished" | "rejected" | "approved" | "pending" | "applied";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  proposed: { label: "Propuesto", variant: "outline" },
  "in-progress": { label: "En Progreso", variant: "default" },
  finished: { label: "Finalizado", variant: "secondary" },
  rejected: { label: "Rechazado", variant: "destructive" },
  approved: { label: "Aprobado", variant: "secondary" },
  pending: { label: "Pendiente", variant: "outline" },
  applied: { label: "Aplicado", variant: "default" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}
