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
  // Científicos y pensadores
  { quote: "La imaginación es más importante que el conocimiento.", author: "Albert Einstein" },
  { quote: "La ciencia es el alma de la prosperidad de las naciones.", author: "Louis Pasteur" },
  { quote: "Nada en la vida es de temer, solo hay que comprenderlo.", author: "Marie Curie" },
  { quote: "El conocimiento habla, pero la sabiduría escucha.", author: "Jimi Hendrix" },
  
  // Filósofos clásicos
  { quote: "Solo sé que no sé nada, y esto es saber.", author: "Sócrates" },
  { quote: "La educación es el arma más poderosa para cambiar el mundo.", author: "Nelson Mandela" },
  { quote: "El que aprende y aprende y no practica, es como el que ara y ara y no siembra.", author: "Platón" },
  { quote: "La duda es el principio de la sabiduría.", author: "Aristóteles" },
  
  // Escritores y pensadores modernos
  { quote: "El futuro pertenece a quienes creen en la belleza de sus sueños.", author: "Eleanor Roosevelt" },
  { quote: "La mejor forma de predecir el futuro es creándolo.", author: "Peter Drucker" },
  { quote: "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.", author: "Winston Churchill" },
  { quote: "Investigar es ver lo que todos han visto y pensar lo que nadie ha pensado.", author: "Albert Szent-Györgyi" },
  
  // Latinoamericanos
  { quote: "Un pueblo ignorante es instrumento ciego de su propia destrucción.", author: "Simón Bolívar" },
  { quote: "La ciencia es la estética de la inteligencia.", author: "Gastón Bachelard" },
  { quote: "Solo el que sabe es libre.", author: "Miguel de Unamuno" },
  
  // Ciencia y tecnología
  { quote: "La perseverancia no es una carrera larga, son muchas carreras cortas.", author: "Walter Elliot" },
  { quote: "El progreso es imposible sin cambio.", author: "George Bernard Shaw" },
  { quote: "La curiosidad es la mecha en la vela del aprendizaje.", author: "William Arthur Ward" },
  { quote: "No hay enseñanza sin investigación ni investigación sin enseñanza.", author: "Paulo Freire" },
  
  // Inspiración general
  { quote: "La mente que se abre a una nueva idea jamás vuelve a su tamaño original.", author: "Albert Einstein" },
  { quote: "Aprende como si fueras a vivir para siempre.", author: "Mahatma Gandhi" },
  { quote: "El genio es 1% inspiración y 99% transpiración.", author: "Thomas Edison" },
  { quote: "Tu trabajo va a llenar gran parte de tu vida. La única forma de estar satisfecho es hacer lo que crees que es un gran trabajo.", author: "Steve Jobs" },
  
  // Motivación académica
  { quote: "La excelencia no es un acto, sino un hábito.", author: "Aristóteles" },
  { quote: "Cada día es una oportunidad para aprender algo nuevo.", author: "Anónimo" },
  { quote: "El conocimiento es poder.", author: "Francis Bacon" },
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
        
        <div className="flex items-center gap-2 text-muted-foreground max-w-md">
          <Sparkles className="h-4 w-4 text-primary/70 flex-shrink-0" />
          <span className="text-sm italic">
            "{motivationalMessage.quote}" <span className="text-primary/80 font-medium">— {motivationalMessage.author}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
