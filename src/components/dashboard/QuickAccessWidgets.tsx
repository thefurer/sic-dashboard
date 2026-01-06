import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardCheck, 
  ListTodo, 
  FolderOpen, 
  Users, 
  UserCheck, 
  FileSearch,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAccessWidgetsProps {
  isAdmin: boolean;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  variant?: "default" | "highlight";
}

const researcherActions: QuickAction[] = [
  {
    label: "Mi Evaluación",
    description: "Completar evaluación anual",
    icon: ClipboardCheck,
    path: "/evaluation",
    variant: "highlight",
  },
  {
    label: "Mis Tareas",
    description: "Ver actividades asignadas",
    icon: ListTodo,
    path: "/my-tasks",
  },
  {
    label: "Mis Proyectos",
    description: "Gestionar proyectos",
    icon: FolderOpen,
    path: "/projects",
  },
];

const adminActions: QuickAction[] = [
  {
    label: "Revisar Evaluaciones",
    description: "Evaluaciones pendientes",
    icon: FileSearch,
    path: "/admin/evaluations",
    variant: "highlight",
  },
  {
    label: "Revisar Tareas",
    description: "Tareas enviadas",
    icon: ClipboardCheck,
    path: "/admin/task-reviews",
  },
  {
    label: "Solicitudes",
    description: "Aprobaciones pendientes",
    icon: UserCheck,
    path: "/admin/pending-approvals",
  },
  {
    label: "Directorio",
    description: "Gestionar usuarios",
    icon: Users,
    path: "/admin/users",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const QuickAccessWidgets = ({ isAdmin }: QuickAccessWidgetsProps) => {
  const navigate = useNavigate();
  const actions = isAdmin ? adminActions : researcherActions;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const isHighlight = action.variant === "highlight";
        
        return (
          <motion.div key={action.path} variants={itemVariants}>
            <Button
              variant="outline"
              onClick={() => navigate(action.path)}
              className={`
                w-full h-auto flex flex-col items-start gap-2 p-4 rounded-2xl
                border-border hover:border-primary/50 
                transition-all duration-300 group
                ${isHighlight 
                  ? "bg-primary/10 border-primary/30 hover:bg-primary/20" 
                  : "bg-card hover:bg-muted"
                }
              `}
            >
              <div className={`
                p-2 rounded-xl transition-colors
                ${isHighlight 
                  ? "bg-primary/20 group-hover:bg-primary/30" 
                  : "bg-muted group-hover:bg-primary/10"
                }
              `}>
                <Icon className={`h-5 w-5 ${isHighlight ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  {action.label}
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
