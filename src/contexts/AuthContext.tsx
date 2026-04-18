import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getAppOrigin } from '@/lib/platform';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, crmNumber: string, specialty: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WRONG_ROLE_ERROR = 'Esta conta é de paciente. Use o app do paciente.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, crmNumber: string, specialty: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'doctor', crm_number: crmNumber, specialty },
        emailRedirectTo: getAppOrigin(),
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Validate: must have doctor_profile OR role='doctor'. Permissive on errors.
    if (data.user) {
      try {
        const [profileRes, docRes] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle(),
          supabase.from('doctor_profiles').select('id').eq('id', data.user.id).maybeSingle(),
        ]);
        const isDoctor = profileRes.data?.role === 'doctor' || !!docRes.data;
        if (!isDoctor) {
          await supabase.auth.signOut();
          return { error: WRONG_ROLE_ERROR };
        }
      } catch {
        // Permissive on validation errors
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
