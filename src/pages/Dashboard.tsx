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
    <div className="space-y-8">
      {/* Header Section - Premium Glass Card */}
      <div className="glass-card-hover p-8 animate-fade-in-up animate-fade-in-up-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-emerald-500 to-accent bg-clip-text text-transparent">
              Noticias y Novedades
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">
              Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
            </p>
          </div>
          
          {isSuperAdmin && (
            <Button 
              onClick={() => setShowManager(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 active:scale-95 px-6 py-2 font-semibold"
            >
              <Settings className="h-5 w-5 mr-2" />
              Gestionar Noticias
            </Button>
          )}
        </div>
      </div>

      {/* Bento Grid Layout - News Carousel */}
      <div className="glass-card-hover p-8 animate-fade-in-up animate-fade-in-up-2">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Últimas Publicaciones</h2>
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[450px] rounded-3xl" />
            ))}
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
              {newsPosts.map((news, idx) => (
                <CarouselItem key={news.id} className="pl-6 md:basis-1/2 lg:basis-1/3 animate-fade-in-up" style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
                  <div className="rounded-3xl overflow-hidden cursor-pointer group floating-card h-[450px]">
                    <NewsCard
                      title={news.title}
                      shortDescription={news.short_description}
                      imageUrl={news.image_url}
                      onClick={() => setSelectedNews(news)}
                    />
                    {/* Gradient Overlay with Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-gradient-to-r from-white/70 to-white/50 dark:from-slate-900/70 dark:to-slate-900/50 backdrop-blur-md border-white/40 hover:bg-white dark:hover:bg-slate-800 shadow-lg" />
            <CarouselNext className="right-2 bg-gradient-to-r from-white/70 to-white/50 dark:from-slate-900/70 dark:to-slate-900/50 backdrop-blur-md border-white/40 hover:bg-white dark:hover:bg-slate-800 shadow-lg" />
          </Carousel>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-6">No hay noticias disponibles</p>
            {isSuperAdmin && (
              <Button 
                onClick={() => setShowManager(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
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
