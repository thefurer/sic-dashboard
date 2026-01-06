import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Newspaper, TrendingUp } from "lucide-react";
import { useNewsPosts } from "@/hooks/useNewsPosts";
import type { NewsPost } from "@/hooks/useNewsPosts";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsDetailModal } from "@/components/news/NewsDetailModal";
import { NewsManager } from "@/components/news/NewsManager";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { WelcomeGreeting } from "@/components/dashboard/WelcomeGreeting";
import { QuickAccessWidgets } from "@/components/dashboard/QuickAccessWidgets";
import { UserStatusPanel } from "@/components/dashboard/UserStatusPanel";
import { QuickStatsRow } from "@/components/dashboard/QuickStatsRow";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import gisicfLogo from "@/assets/gisicf-logo.png";

const Dashboard = () => {
  const { data: newsPosts, isLoading } = useNewsPosts();
  const { profile } = useProfile();
  const { data: userRole } = useUserRole();
  const [selectedNews, setSelectedNews] = useState<NewsPost | null>(null);
  const [showManager, setShowManager] = useState(false);
  
  // Super admin check - only admin role gets news management
  const isSuperAdmin = userRole === "admin";
  
  // Dashboard stats
  const { data: stats, isLoading: statsLoading } = useDashboardStats(isSuperAdmin);

  return (
    <div className="min-h-[70vh] font-sans space-y-6">
      {/* Welcome Greeting - NEW */}
      <WelcomeGreeting userName={profile?.full_name || "Investigador"} />

      {/* Quick Access Widgets - NEW */}
      <QuickAccessWidgets isAdmin={isSuperAdmin} />

      {/* Quick Stats Row - NEW */}
      {stats && (
        <QuickStatsRow stats={stats} isAdmin={isSuperAdmin} isLoading={statsLoading} />
      )}

      {/* Header Section - EXISTING */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 dark:bg-primary/40 blur-2xl rounded-full" />
            <img src={gisicfLogo} alt="GISICF" className="relative h-16 w-auto" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Noticias y Novedades
            </h1>
            <p className="text-muted-foreground mt-1">
              Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <Button 
            onClick={() => setShowManager(true)} 
            className="btn-primary-glow text-primary-foreground font-semibold px-6 py-3 rounded-2xl"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Noticias
          </Button>
        )}
      </div>

      {/* Bento Grid Layout - EXISTING with UserStatusPanel added */}
      <div className="bento-grid">
        {/* Main News Section - spans 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <div className="metric-tile !p-8 h-full">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-primary" />
              Últimas Noticias
            </h2>
            
            {/* News Carousel */}
            <div className="w-full rounded-2xl overflow-hidden">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <Skeleton className="h-[320px] rounded-2xl bg-muted" />
                  <Skeleton className="h-[320px] rounded-2xl bg-muted" />
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
                      <CarouselItem key={news.id} className="pl-4 basis-full md:basis-1/2">
                        <NewsCard
                          title={news.title}
                          shortDescription={news.short_description}
                          imageUrl={news.image_url}
                          onClick={() => setSelectedNews(news)}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-card/80 border-border text-foreground hover:bg-muted hover:text-foreground" />
                  <CarouselNext className="right-4 bg-card/80 border-border text-foreground hover:bg-muted hover:text-foreground" />
                </Carousel>
              ) : (
                <div className="text-center py-16 bg-muted/50 rounded-2xl border border-border">
                  <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg">No hay noticias disponibles</p>
                  {isSuperAdmin && (
                    <Button 
                      onClick={() => setShowManager(true)} 
                      className="mt-6 btn-primary-glow text-primary-foreground rounded-xl"
                    >
                      Agregar Primera Noticia
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Status Panel - NEW */}
        <div className="col-span-12 lg:col-span-4">
          {stats && (
            <UserStatusPanel stats={stats} isAdmin={isSuperAdmin} isLoading={statsLoading} />
          )}
        </div>

        {/* Recent Activity Timeline - Full Width - EXISTING */}
        <div className="col-span-12">
          <div className="metric-tile">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-glow-container !w-10 !h-10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Actividad Reciente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsPosts && newsPosts.length > 0 ? (
                newsPosts.slice(0, 6).map((n) => (
                  <div 
                    key={n.id} 
                    className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedNews(n)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {n.short_description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal - EXISTING */}
      <NewsDetailModal
        news={selectedNews}
        open={!!selectedNews}
        onOpenChange={(open) => !open && setSelectedNews(null)}
      />

      {/* Manager Modal - EXISTING */}
      {isSuperAdmin && (
        <NewsManager open={showManager} onOpenChange={setShowManager} />
      )}
    </div>
  );
};

export default Dashboard;
