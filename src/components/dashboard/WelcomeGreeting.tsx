import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles, Sun, Moon, Sunset } from "lucide-react";

interface WelcomeGreetingProps {
  userName: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: "Buenos días", icon: Sun };
  if (hour >= 12 && hour < 19) return { text: "Buenas tardes", icon: Sunset };
  return { text: "Buenas noches", icon: Moon };
};

const motivationalMessages = [
  "¡Hagamos que hoy cuente!",
  "Tu investigación marca la diferencia",
  "Cada paso cuenta hacia el éxito",
  "Construyendo conocimiento, transformando vidas",
];

export const WelcomeGreeting = ({ userName }: WelcomeGreetingProps) => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const today = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
  
  // Pick a random motivational message based on the day
  const messageIndex = new Date().getDate() % motivationalMessages.length;
  const motivationalMessage = motivationalMessages[messageIndex];

  // Get first name only
  const firstName = userName?.split(" ")[0] || "Investigador";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="metric-tile !p-6 relative overflow-hidden"
    >
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="icon-glow-container !w-12 !h-12">
            <GreetingIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {greeting.text}, <span className="text-primary">{firstName}</span>
            </h2>
            <p className="text-muted-foreground mt-1">{todayCapitalized}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary/70" />
          <span className="text-sm italic">{motivationalMessage}</span>
        </div>
      </div>
    </motion.div>
  );
};
