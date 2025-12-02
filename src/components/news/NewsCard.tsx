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
      whileHover={{ scale: 1.02 }}
      className="relative h-[400px] rounded-2xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 group-hover:translate-y-[-8px]">
        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-300 text-sm line-clamp-2">
          {shortDescription}
        </p>
      </div>
    </motion.div>
  );
};
