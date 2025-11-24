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
        console.log('Auth state change:', event, session?.user?.email);
        
        // Validate email domain on sign-in
        if (event === 'SIGNED_IN') {
          if (session?.user?.email && !session.user.email.endsWith('@unesum.edu.ec')) {
            console.log('Invalid domain detected:', session.user.email);
            toast.error('Solo se permiten correos institucionales con dominio @unesum.edu.ec');
            // Sign out immediately
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            navigate('/auth');
            return;
          }
          
          // Valid login
          setSession(session);
          setUser(session?.user ?? null);
          
          // Navigate to dashboard
          if (window.location.pathname === '/auth') {
            navigate('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else {
          // For other events, just update the state
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Validate existing session
      if (session?.user?.email) {
        if (!session.user.email.endsWith('@unesum.edu.ec')) {
          toast.error('Solo se permiten correos con dominio @unesum.edu.ec');
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
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

  const signUp = async (email: string, password: string, phoneNumber: string, researcherCode: string) => {
    // Validate email domain
    if (!email.endsWith('@unesum.edu.ec')) {
      toast.error('Solo se permiten correos con dominio @unesum.edu.ec');
      return { error: { message: 'Invalid email domain' } };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          phone_number: phoneNumber,
          researcher_code: researcherCode,
        },
      },
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registro exitoso. Por favor espere la aprobación del administrador.');
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        queryParams: {
          hd: 'unesum.edu.ec', // Suggest domain to Google
          prompt: 'select_account', // Force account selection
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
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
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