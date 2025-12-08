import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Newspaper, TrendingUp } from "lucide-react";
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
    <div className="min-h-[70vh] font-sans grid grid-cols-1 sm:grid-cols-12 gap-6">

      {/* Main column: News / Hero (Bento large) */}
      <div className="col-span-12 sm:col-span-8">
        <div className="glass-card p-6 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
                Noticias y Novedades
              </h1>
              <p className="text-muted-foreground mt-1">
                Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
              </p>
            </div>

            {isSuperAdmin && (
              <Button 
                onClick={() => setShowManager(true)} 
                className="ml-4 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gestionar Noticias
              </Button>
            )}
          </div>

          {/* News Carousel */}
          <div className="w-full rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[380px] rounded-2xl" />
                <Skeleton className="h-[380px] rounded-2xl" />
                <Skeleton className="h-[380px] rounded-2xl" />
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
                <CarouselPrevious className="left-4 glass-card border-white/20 hover:bg-white/20 dark:hover:bg-white/10" />
                <CarouselNext className="right-4 glass-card border-white/20 hover:bg-white/20 dark:hover:bg-white/10" />
              </Carousel>
            ) : (
              <div className="text-center py-12 glass-card">
                <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay noticias disponibles</p>
                {isSuperAdmin && (
                  <Button onClick={() => setShowManager(true)} className="mt-4">
                    Agregar Primera Noticia
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right column: KPIs and Recent Activity */}
      <aside className="col-span-12 sm:col-span-4 space-y-6">
        {/* KPI Card with Glow */}
        <div className="glass-card p-6 hover:shadow-2xl transition-all duration-500 group">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center border border-primary/20">
                <Newspaper className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Publicaciones</p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
                {newsPosts ? newsPosts.length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="glass-card p-6 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          </div>
          <div className="space-y-4">
            {newsPosts && newsPosts.length > 0 ? (
              newsPosts.slice(0, 5).map((n, idx) => (
                <div key={n.id} className="flex items-start gap-4 group">
                  <div className="flex flex-col items-center">
                    <span className="w-3 h-3 rounded-full bg-primary mt-1 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all" />
                    {idx < Math.min(4, newsPosts.length - 1) && (
                      <span className="h-full w-px bg-gradient-to-b from-primary/50 to-transparent my-1 block min-h-[30px]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {n.short_description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </aside>

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
