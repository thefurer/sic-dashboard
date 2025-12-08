import { motion } from "framer-motion";

interface NewsCardProps {
  title: string;
  shortDescription: string;
  imageUrl: string;
  onClick: () => void;
}

export const NewsCard = ({ title, shortDescription, imageUrl, onClick }: NewsCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative h-[400px] rounded-2xl overflow-hidden cursor-pointer group border border-white/10 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-500"
      onClick={onClick}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay - Deeper */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 group-hover:translate-y-[-8px]">
        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
          {title}
        </h3>
        <p className="text-slate-300 text-sm line-clamp-2">
          {shortDescription}
        </p>
        
        {/* Read More Indicator */}
        <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-sm font-medium">Leer más</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
