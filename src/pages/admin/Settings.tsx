import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Save, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState("");
  const [headerSubtext, setHeaderSubtext] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [careerName, setCareerName] = useState("");
  const [logoLeft, setLogoLeft] = useState<string | null>(null);
  const [logoRight, setLogoRight] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setSettingsId(data.id);
        setInstitutionName(data.institution_name || "");
        setHeaderSubtext(data.header_subtext || "");
        setFacultyName(data.faculty_name || "");
        setCareerName(data.career_name || "");
        setLogoLeft(data.header_logo_left);
        setLogoRight(data.header_logo_right);
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
    }
  };

  const handleLogoUpload = async (file: File, position: "left" | "right") => {
    try {
      setUploading(position);
      const fileExt = file.name.split(".").pop();
      const fileName = `${position}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("institutional-docs")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("institutional-docs")
        .getPublicUrl(filePath);

      if (position === "left") {
        setLogoLeft(urlData.publicUrl);
      } else {
        setLogoRight(urlData.publicUrl);
      }

      toast({
        title: "Logo cargado",
        description: "El logo se ha subido correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const settingsData = {
        institution_name: institutionName,
        header_subtext: headerSubtext,
        faculty_name: facultyName,
        career_name: careerName,
        header_logo_left: logoLeft,
        header_logo_right: logoRight,
      };

      const { error } = await supabase
        .from("app_settings")
        .update(settingsData)
        .eq("id", settingsId);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin/planning")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Personaliza la información institucional que aparecerá en los documentos PDF
        </p>
      </div>

      <div className="space-y-6">
        {/* PDF Header Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Personalización de Documentos PDF</CardTitle>
            <CardDescription>
              Configura el membrete institucional que aparecerá en todos los PDFs generados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Uploads */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Logo Izquierdo (Universidad)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {logoLeft ? (
                    <div className="space-y-2">
                      <img src={logoLeft} alt="Logo izquierdo" className="mx-auto h-24 object-contain" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("logo-left")?.click()}
                        disabled={uploading === "left"}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading === "left" ? "Subiendo..." : "Cambiar Logo"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("logo-left")?.click()}
                      disabled={uploading === "left"}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading === "left" ? "Subiendo..." : "Subir Logo"}
                    </Button>
                  )}
                  <input
                    id="logo-left"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file, "left");
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo Derecho (Carrera/Facultad)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {logoRight ? (
                    <div className="space-y-2">
                      <img src={logoRight} alt="Logo derecho" className="mx-auto h-24 object-contain" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("logo-right")?.click()}
                        disabled={uploading === "right"}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading === "right" ? "Subiendo..." : "Cambiar Logo"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("logo-right")?.click()}
                      disabled={uploading === "right"}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading === "right" ? "Subiendo..." : "Subir Logo"}
                    </Button>
                  )}
                  <input
                    id="logo-right"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file, "right");
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Text Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Nombre de la Institución</Label>
                <Input
                  id="institution"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtext">Texto de Registro/Resolución</Label>
                <Textarea
                  id="subtext"
                  value={headerSubtext}
                  onChange={(e) => setHeaderSubtext(e.target.value)}
                  placeholder="Creada mediante ley publicada en el Registro Oficial..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">Nombre de la Facultad</Label>
                <Input
                  id="faculty"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="FACULTAD DE CIENCIAS TÉCNICAS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="career">Nombre de la Carrera</Label>
                <Input
                  id="career"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  placeholder="CARRERA DE TECNOLOGÍAS DE LA INFORMACIÓN"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Vista Previa del Membrete</span>
              </div>
              <div className="bg-background border rounded p-4">
                <div className="flex items-start justify-between gap-4">
                  {logoLeft && (
                    <img src={logoLeft} alt="Logo izquierdo" className="h-16 object-contain" />
                  )}
                  <div className="flex-1 text-center space-y-1">
                    <h3 className="font-bold text-sm">{institutionName || "UNIVERSIDAD"}</h3>
                    <p className="text-xs text-muted-foreground">{headerSubtext}</p>
                    <p className="text-xs font-medium">{facultyName}</p>
                    <p className="text-xs font-medium">{careerName}</p>
                  </div>
                  {logoRight && (
                    <img src={logoRight} alt="Logo derecho" className="h-16 object-contain" />
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
