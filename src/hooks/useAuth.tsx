import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, phoneNumber: string, researcherCode: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
        
        // Don't auto-navigate on SIGNED_IN - let ProtectedRoute handle approval check
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      
      // Update last_login_at in profiles
      if (data.user) {
        setTimeout(async () => {
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);
        }, 0);
      }
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, phoneNumber: string, researcherCode: string) => {
    // Use production URL to avoid localhost redirect issues
    const redirectUrl = 'https://gisicf.com/auth';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          phone_number: phoneNumber,
          researcher_code: researcherCode,
        },
      },
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registro exitoso. Revise su correo electrónico (incluyendo la carpeta SPAM) para confirmar su cuenta. Luego espere la aprobación del administrador.', {
        duration: 8000,
      });
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    
    if (error) {
      toast.error(error.message);
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.info('Logged out');
    navigate('/auth');
  };

  const resetPassword = async (email: string) => {
    // Use production URL to avoid localhost redirect issues
    const redirectUrl = 'https://gisicf.com/auth?reset=true';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Se ha enviado un enlace de recuperación a su correo electrónico. Revise también la carpeta SPAM.', {
        duration: 6000,
      });
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}