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
    <div className="min-h-screen glass-bg-light dark:glass-bg-dark p-6 space-y-8">
      {/* Header Section - Glass Card */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/40 dark:border-slate-700/50 rounded-[30px] shadow-sm hover:shadow-lg transition-all duration-300 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Noticias y Novedades
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
            </p>
          </div>
          
          {isSuperAdmin && (
            <Button 
              onClick={() => setShowManager(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gestionar Noticias
            </Button>
          )}
        </div>
      </div>

      {/* News Carousel - Full Width Glass Container */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/40 dark:border-slate-700/50 rounded-[30px] shadow-sm hover:shadow-lg transition-all duration-300 p-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[450px] rounded-[30px]" />
            <Skeleton className="h-[450px] rounded-[30px]" />
            <Skeleton className="h-[450px] rounded-[30px]" />
          </div>
        ) : newsPosts && newsPosts.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {newsPosts.map((news) => (
                <CarouselItem key={news.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <NewsCard
                    title={news.title}
                    shortDescription={news.short_description}
                    imageUrl={news.image_url}
                    onClick={() => setSelectedNews(news)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/40 hover:bg-white dark:hover:bg-slate-800" />
            <CarouselNext className="right-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/40 hover:bg-white dark:hover:bg-slate-800" />
          </Carousel>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No hay noticias disponibles</p>
            {isSuperAdmin && (
              <Button 
                onClick={() => setShowManager(true)} 
                className="mt-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
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
