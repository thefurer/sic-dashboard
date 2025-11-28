import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NewsPost {
  id: string;
  title: string;
  short_description: string;
  full_content: string;
  image_url: string;
  video_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNewsPosts = () => {
  return useQuery({
    queryKey: ["news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NewsPost[];
    },
  });
};

export const useCreateNewsPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsPost: Omit<NewsPost, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("news_posts")
        .insert(newsPost)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-posts"] });
      toast.success("Noticia creada exitosamente");
    },
    onError: () => {
      toast.error("Error al crear la noticia");
    },
  });
};

export const useUpdateNewsPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewsPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("news_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-posts"] });
      toast.success("Noticia actualizada exitosamente");
    },
    onError: () => {
      toast.error("Error al actualizar la noticia");
    },
  });
};

export const useDeleteNewsPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_posts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-posts"] });
      toast.success("Noticia eliminada exitosamente");
    },
    onError: () => {
      toast.error("Error al eliminar la noticia");
    },
  });
};
