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
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
      async (event, session) => {
        // Validate email domain only on sign-in events
        if (event === 'SIGNED_IN' && session?.user?.email && !session.user.email.endsWith('@unesum.edu.ec')) {
          toast.error('Solo se permiten correos con dominio @unesum.edu.ec');
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(async () => {
            await supabase.auth.signOut();
            navigate('/auth');
          }, 100);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer navigation to avoid blocking auth flow
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            if (window.location.pathname === '/auth') {
              navigate('/dashboard');
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Validate existing session
      if (session?.user?.email && !session.user.email.endsWith('@unesum.edu.ec')) {
        toast.error('Solo se permiten correos con dominio @unesum.edu.ec');
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    // Validate email domain
    if (!email.endsWith('@unesum.edu.ec')) {
      toast.error('Solo se permiten correos con dominio @unesum.edu.ec');
      return { error: { message: 'Invalid email domain' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          hd: 'unesum.edu.ec', // Restrict to unesum.edu.ec domain
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

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signInWithGoogle, signOut }}>
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