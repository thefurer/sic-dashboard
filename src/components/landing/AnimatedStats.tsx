import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, FileText, FolderOpen, BookOpen } from "lucide-react";
import { useLandingStats } from "@/hooks/useLandingStats";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
}

function AnimatedCounter({ value, inView }: { value: number; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, inView]);

  return <span>{count}</span>;
}

function StatItem({ icon: Icon, value, label, suffix = "+" }: StatItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
        <AnimatedCounter value={value} inView={isInView} />
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="text-slate-600 dark:text-white/60 font-medium">{label}</p>
    </motion.div>
  );
}

function StatSkeleton() {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <Skeleton className="w-14 h-14 rounded-2xl mb-4" />
      <Skeleton className="h-12 w-24 mb-2" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
}

export function AnimatedStats() {
  const { data: stats, isLoading } = useLandingStats();

  const statItems = [
    { icon: Users, value: stats?.researchers || 0, label: "Investigadores Activos", suffix: "+" },
    { icon: FileText, value: stats?.publications || 0, label: "Publicaciones Indexadas", suffix: "+" },
    { icon: FolderOpen, value: stats?.projects || 0, label: "Proyectos Ejecutados", suffix: "+" },
    { icon: BookOpen, value: stats?.researchLines || 17, label: "Líneas de Investigación", suffix: "" },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="glass-card p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              statItems.map((stat) => (
                <StatItem
                  key={stat.label}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
