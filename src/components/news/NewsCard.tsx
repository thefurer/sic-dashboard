import { motion } from "framer-motion";
import { useState } from "react";

interface NewsCardProps {
  title: string;
  shortDescription: string;
  imageUrl: string;
  onClick: () => void;
}

export const NewsCard = ({ title, shortDescription, imageUrl, onClick }: NewsCardProps) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80";
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      className="relative h-[450px] rounded-[30px] overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-500"
      onClick={onClick}
    >
      {/* Background Image with Error Handling */}
      <img
        src={imgError ? fallbackImage : imageUrl}
        alt={title}
        onError={() => setImgError(true)}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Enhanced Gradient Overlay - Glassmorphic */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20" />
      
      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-all duration-500 group-hover:translate-y-[-4px]">
        <h3 className="text-3xl font-bold text-white mb-3 line-clamp-2 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-200 text-base line-clamp-3 leading-relaxed">
          {shortDescription}
        </p>
      </div>
      
      {/* Hover Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
};
