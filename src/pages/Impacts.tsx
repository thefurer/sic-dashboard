import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Users, Leaf, DollarSign } from "lucide-react";

export default function Impacts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medición de Impactos</h1>
        <p className="text-muted-foreground">Evaluación de impacto social, ambiental y económico</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Impacto Social</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="direct-beneficiaries">Beneficiarios Directos</Label>
              <Input id="direct-beneficiaries" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indirect-beneficiaries">Beneficiarios Indirectos</Label>
              <Input id="indirect-beneficiaries" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality-improvement">Mejora de Calidad de Vida</Label>
              <Textarea
                id="quality-improvement"
                placeholder="Describa las mejoras observadas..."
                rows={4}
              />
            </div>
            <Button className="w-full">Guardar Impacto Social</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Impacto Ambiental</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resource-consumption">Consumo de Recursos</Label>
              <Input id="resource-consumption" placeholder="Agua, energía, etc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waste-generation">Generación de Residuos</Label>
              <Input id="waste-generation" placeholder="Kg/año" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mitigation">Acciones de Mitigación</Label>
              <Textarea
                id="mitigation"
                placeholder="Describa las acciones implementadas..."
                rows={4}
              />
            </div>
            <Button className="w-full">Guardar Impacto Ambiental</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Impacto Económico</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investment">Inversión ($)</Label>
              <Input id="investment" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roi">Retorno de Inversión (%)</Label>
              <Input id="roi" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings">Ahorro de Costos</Label>
              <Textarea
                id="savings"
                placeholder="Describa los ahorros generados..."
                rows={4}
              />
            </div>
            <Button className="w-full">Guardar Impacto Económico</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
