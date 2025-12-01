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
    <div className="min-h-[70vh] font-sans grid grid-cols-1 sm:grid-cols-12 gap-6 p-6">

      {/* Main column: News / Hero (Bento large) */}
      <div className="col-span-12 sm:col-span-8">
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/40 dark:border-slate-700/50 rounded-[30px] shadow-sm hover:shadow-lg transition-all duration-300 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Noticias y Novedades</h1>
              <p className="text-muted-foreground mt-1">Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos</p>
            </div>

            {isSuperAdmin && (
              <Button onClick={() => setShowManager(true)} className="ml-4">
                <Settings className="h-4 w-4 mr-2" />
                Gestionar Noticias
              </Button>
            )}
          </div>

          {/* News Carousel - edge to edge inside glass card */}
          <div className="w-full rounded-[20px] overflow-hidden">
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
                      <div className="relative rounded-2xl overflow-hidden shadow-sm">
                        <NewsCard
                          title={news.title}
                          shortDescription={news.short_description}
                          imageUrl={news.image_url}
                          onClick={() => setSelectedNews(news)}
                        />
                        {/* Gradient overlay for readability */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      </div>
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
        </div>
      </div>

      {/* Right column: KPIs and Recent Activity (tiles) */}
      <aside className="col-span-12 sm:col-span-4 space-y-6">
        {/* KPI Tile - example using newsPosts count */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/40 dark:border-slate-700/50 rounded-[30px] shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-start">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-emerald-200/40 blur-sm -z-0 absolute inset-0 transform -translate-x-1 -translate-y-1"></div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center z-10">
                  <Settings className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">{newsPosts ? newsPosts.length : 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - timeline built from news titles (visual only) */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/40 dark:border-slate-700/50 rounded-[30px] shadow-sm hover:shadow-lg transition-all duration-300 p-6">
          <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {newsPosts && newsPosts.length > 0 ? (
              newsPosts.slice(0, 5).map((n, idx) => (
                <div key={n.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-3 h-3 rounded-full bg-primary mt-1"></span>
                    {idx < Math.min(4, newsPosts.length - 1) && <span className="h-full w-px bg-muted my-1 block" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.short_description}</p>
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
