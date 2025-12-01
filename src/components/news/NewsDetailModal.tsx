import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NewsPost } from "@/hooks/useNewsPosts";

interface NewsDetailModalProps {
  news: NewsPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsDetailModal = ({ news, open, onOpenChange }: NewsDetailModalProps) => {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Hero Image */}
        <div className="relative -mt-6 -mx-6 mb-6 h-64 overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-2">{news.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(news.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          {news.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={news.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{news.full_content}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
