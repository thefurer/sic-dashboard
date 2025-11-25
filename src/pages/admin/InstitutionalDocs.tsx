import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Upload, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["Misión", "Visión", "Planificación"] as const;
type Category = typeof CATEGORIES[number];

export default function InstitutionalDocs() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<Category | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["institutional-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: Category }) => {
      // Upload file to storage
      const fileName = `${category.toLowerCase()}-${Date.now()}.pdf`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("institutional-docs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("institutional-docs")
        .getPublicUrl(fileName);

      // Check if document exists
      const { data: existingDoc } = await supabase
        .from("documents")
        .select("id")
        .eq("category", category)
        .maybeSingle();

      if (existingDoc) {
        // Update existing
        const { error: updateError } = await supabase
          .from("documents")
          .update({
            title: file.name,
            file_url: urlData.publicUrl,
          })
          .eq("id", existingDoc.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("documents")
          .insert({
            title: file.name,
            file_url: urlData.publicUrl,
            category,
          });

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, { category }) => {
      queryClient.invalidateQueries({ queryKey: ["institutional-docs"] });
      toast.success(`Documento de ${category} actualizado correctamente`);
      setUploading(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al subir el documento");
      setUploading(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: Category) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    setUploading(category);
    uploadMutation.mutate({ file, category });
  };

  const getDocumentForCategory = (category: Category) => {
    return documents?.find((doc) => doc.category === category);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión Institucional</h1>
        <p className="text-muted-foreground mt-2">
          Administra los documentos institucionales que se muestran en la página pública
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {CATEGORIES.map((category) => {
          const doc = getDocumentForCategory(category);
          const isUploading = uploading === category;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {category}
                </CardTitle>
                <CardDescription>
                  {doc ? "Documento configurado" : "Sin documento"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {doc && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Archivo actual:</p>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {doc.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`file-${category}`}>
                    {doc ? "Actualizar documento" : "Subir documento"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`file-${category}`}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, category)}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    {isUploading && (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Solo archivos PDF
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
