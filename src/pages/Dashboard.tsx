import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Newspaper, TrendingUp, Users, FileText, Award } from "lucide-react";
import { useNewsPosts } from "@/hooks/useNewsPosts";
import type { NewsPost } from "@/hooks/useNewsPosts";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsDetailModal } from "@/components/news/NewsDetailModal";
import { NewsManager } from "@/components/news/NewsManager";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
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

  // Metric Card Component with Green Glow
  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    delay = 0 
  }: { 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    value: number | string;
    delay?: number;
  }) => (
    <div 
      className="metric-tile group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="icon-glow-container group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7 text-[hsl(153,100%,45%)]" />
        </div>
        <div>
          <p className="text-sm text-white/50 font-medium">{label}</p>
          <p className="text-4xl font-bold text-white tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[70vh] font-sans space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[hsla(153,100%,24%,0.4)] blur-2xl rounded-full" />
            <img src={gisicfLogo} alt="GISICF" className="relative h-16 w-auto" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Noticias y Novedades
            </h1>
            <p className="text-white/50 mt-1">
              Grupo de Investigación: Sistemas Inteligentes y Ciberfísicos
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <Button 
            onClick={() => setShowManager(true)} 
            className="btn-primary-glow text-white font-semibold px-6 py-3 rounded-2xl"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Noticias
          </Button>
        )}
      </div>

      {/* Bento Grid Layout */}
      <div className="bento-grid">
        {/* Main News Section - spans 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <div className="metric-tile !p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-[hsl(153,100%,45%)]" />
              Últimas Noticias
            </h2>
            
            {/* News Carousel */}
            <div className="w-full rounded-2xl overflow-hidden">
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <Skeleton className="h-[320px] rounded-2xl bg-white/5" />
                  <Skeleton className="h-[320px] rounded-2xl bg-white/5" />
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
                      <CarouselItem key={news.id} className="pl-4 md:basis-1/2">
                        <NewsCard
                          title={news.title}
                          shortDescription={news.short_description}
                          imageUrl={news.image_url}
                          onClick={() => setSelectedNews(news)}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-slate-900/80 border-white/20 text-white hover:bg-white/20 hover:text-white" />
                  <CarouselNext className="right-4 bg-slate-900/80 border-white/20 text-white hover:bg-white/20 hover:text-white" />
                </Carousel>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                  <Newspaper className="h-16 w-16 mx-auto text-white/20 mb-4" />
                  <p className="text-white/40 text-lg">No hay noticias disponibles</p>
                  {isSuperAdmin && (
                    <Button 
                      onClick={() => setShowManager(true)} 
                      className="mt-6 btn-primary-glow text-white rounded-xl"
                    >
                      Agregar Primera Noticia
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - KPIs */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Publications Count */}
          <MetricCard 
            icon={Newspaper} 
            label="Publicaciones" 
            value={newsPosts ? newsPosts.length : 0}
            delay={0}
          />
          
          {/* Team Members - Placeholder */}
          <MetricCard 
            icon={Users} 
            label="Investigadores" 
            value={12}
            delay={100}
          />
          
          {/* Active Projects - Placeholder */}
          <MetricCard 
            icon={FileText} 
            label="Proyectos Activos" 
            value={8}
            delay={200}
          />
        </div>

        {/* Recent Activity Timeline - Full Width */}
        <div className="col-span-12">
          <div className="metric-tile">
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-glow-container !w-10 !h-10">
                <TrendingUp className="h-5 w-5 text-[hsl(153,100%,45%)]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Actividad Reciente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsPosts && newsPosts.length > 0 ? (
                newsPosts.slice(0, 6).map((n, idx) => (
                  <div 
                    key={n.id} 
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[hsla(153,100%,24%,0.3)] hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedNews(n)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full bg-[hsl(153,100%,35%)] ring-4 ring-[hsla(153,100%,24%,0.2)] group-hover:ring-[hsla(153,100%,24%,0.4)] transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[hsl(153,100%,45%)] transition-colors">
                        {n.title}
                      </p>
                      <p className="text-xs text-white/40 line-clamp-2 mt-1">
                        {n.short_description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-sm text-white/40">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>
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