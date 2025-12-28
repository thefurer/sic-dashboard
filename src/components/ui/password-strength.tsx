import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: Requirement[] = useMemo(() => [
    { label: "Mínimo 6 caracteres", met: password.length >= 6 },
    { label: "Una mayúscula", met: /[A-Z]/.test(password) },
    { label: "Una minúscula", met: /[a-z]/.test(password) },
    { label: "Un número", met: /[0-9]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "bg-slate-200" };
    if (metCount === 1) return { level: 1, label: "Débil", color: "bg-red-500" };
    if (metCount === 2) return { level: 2, label: "Regular", color: "bg-orange-500" };
    if (metCount === 3) return { level: 3, label: "Buena", color: "bg-yellow-500" };
    return { level: 4, label: "Fuerte", color: "bg-green-500" };
  }, [requirements]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 mt-2"
    >
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <motion.div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                level <= strength.level ? strength.color : "bg-slate-200"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: level * 0.05 }}
            />
          ))}
        </div>
        {strength.label && (
          <span className={`text-xs font-medium ${
            strength.level <= 1 ? "text-red-600" :
            strength.level === 2 ? "text-orange-600" :
            strength.level === 3 ? "text-yellow-600" :
            "text-green-600"
          }`}>
            {strength.label}
          </span>
        )}
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-2 gap-1">
        {requirements.map((req, i) => (
          <motion.div
            key={req.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-1.5"
          >
            {req.met ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-slate-400" />
            )}
            <span className={`text-xs ${req.met ? "text-green-700" : "text-slate-500"}`}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}