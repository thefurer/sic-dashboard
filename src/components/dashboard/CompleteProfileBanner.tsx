import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProfileData {
  full_name: string | null;
  researcher_code: string | null;
  orcid: string | null;
  country_code: string | null;
  cv_url: string | null;
  cedula: string | null;
}

export function CompleteProfileBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, researcher_code, orcid, country_code, cv_url, cedula')
        .eq('id', user.id)
        .single();

      const { data: contact } = await supabase
        .from('profile_contacts')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        const missing: string[] = [];
        
        if (!profile.full_name || profile.full_name === user.email) missing.push('Nombre completo');
        if (!profile.cedula) missing.push('Cédula de identidad');
        if (!contact?.phone) missing.push('Teléfono');
        if (!profile.researcher_code) missing.push('Código de investigador');
        if (!profile.orcid) missing.push('Código ORCID');
        if (!profile.country_code) missing.push('País');
        if (!profile.cv_url) missing.push('CV');

        setMissingFields(missing);
        // Show banner if missing required fields (excluding CV which might be optional)
        setShowBanner(missing.length > 1 || (missing.length === 1 && missing[0] !== 'CV'));
      }
    };

    checkProfile();
  }, [user]);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 p-4 mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
        
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground">
                ¡Completa tu perfil!
              </h3>
              <p className="text-sm text-muted-foreground">
                Te faltan: {missingFields.slice(0, 3).join(', ')}
                {missingFields.length > 3 && ` y ${missingFields.length - 3} más`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                Completar ahora
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBanner(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
