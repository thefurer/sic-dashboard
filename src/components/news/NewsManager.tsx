import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useNewsPosts,
  useCreateNewsPost,
  useUpdateNewsPost,
  useDeleteNewsPost,
  NewsPost,
} from "@/hooks/useNewsPosts";

interface NewsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsManager = ({ open, onOpenChange }: NewsManagerProps) => {
  const { data: newsPosts, isLoading } = useNewsPosts();
  const createMutation = useCreateNewsPost();
  const updateMutation = useUpdateNewsPost();
  const deleteMutation = useDeleteNewsPost();

  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    full_content: "",
    image_url: "",
    video_url: "",
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("news-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("news-media")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("Imagen subida exitosamente");
    } catch (error) {
      toast.error("Error al subir la imagen");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNews) {
      await updateMutation.mutateAsync({ id: editingNews.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }

    resetForm();
  };

  const handleEdit = (news: NewsPost) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      short_description: news.short_description,
      full_content: news.full_content,
      image_url: news.image_url,
      video_url: news.video_url || "",
      is_active: news.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta noticia?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingNews(null);
    setFormData({
      title: "",
      short_description: "",
      full_content: "",
      image_url: "",
      video_url: "",
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Noticias</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingNews ? "Editar Noticia" : "Nueva Noticia"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="short_description">Descripción Corta</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="full_content">Contenido Completo</Label>
                <Textarea
                  id="full_content"
                  value={formData.full_content}
                  onChange={(e) => setFormData({ ...formData, full_content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Imagen de Portada</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="video_url">URL del Video (Opcional)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Noticia Activa</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploading || !formData.image_url}>
                  {editingNews ? "Actualizar" : "Crear"}
                </Button>
                {editingNews && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Noticias Existentes</h3>
            {isLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : (
              <div className="space-y-2">
                {newsPosts?.map((news) => (
                  <div
                    key={news.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{news.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {news.short_description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(news)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(news.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
