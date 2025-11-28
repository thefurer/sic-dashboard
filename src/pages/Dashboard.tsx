import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNewsPosts } from "@/hooks/useNewsPosts";
import type { NewsPost } from "@/hooks/useNewsPosts";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsDetailModal } from "@/components/news/NewsDetailModal";
import { NewsManager } from "@/components/news/NewsManager";
import { useProfile } from "@/hooks/useProfile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: newsPosts, isLoading } = useNewsPosts();
  const { profile } = useProfile();
  const [selectedNews, setSelectedNews] = useState<NewsPost | null>(null);
  const [showManager, setShowManager] = useState(false);

  const isSuperAdmin = profile?.email === "christian.caicedo@unesum.edu.ec";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Noticias y Novedades</h1>
          <p className="text-muted-foreground">
            Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
          </p>
        </div>
        
        {isSuperAdmin && (
          <Button onClick={() => setShowManager(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Noticias
          </Button>
        )}
      </div>

      {/* News Carousel */}
      <div className="relative">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[400px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        ) : newsPosts && newsPosts.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {newsPosts.map((news) => (
                <CarouselItem key={news.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <NewsCard
                    title={news.title}
                    shortDescription={news.short_description}
                    imageUrl={news.image_url}
                    onClick={() => setSelectedNews(news)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay noticias disponibles</p>
            {isSuperAdmin && (
              <Button onClick={() => setShowManager(true)} className="mt-4">
                Agregar Primera Noticia
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        open={!!selectedNews}
        onOpenChange={(open) => !open && setSelectedNews(null)}
      />

      {/* Manager Modal */}
      {isSuperAdmin && (
        <NewsManager open={showManager} onOpenChange={setShowManager} />
      )}
    </div>
  );
};

export default Dashboard;
