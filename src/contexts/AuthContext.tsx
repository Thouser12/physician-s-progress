import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, crmNumber: string, specialty: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WRONG_ROLE_ERROR = 'Esta conta e de paciente. Use o app do paciente.';

/** Returns true if this account is allowed on the doctor app.
 *  Checks both profiles.role='doctor' OR existence of a doctor_profiles row. Permissive on errors.
 */
async function isDoctorAccount(userId: string): Promise<boolean> {
  try {
    const [profileRes, doctorProfileRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
      supabase.from('doctor_profiles').select('id').eq('id', userId).maybeSingle(),
    ]);
    if (profileRes.data?.role === 'doctor') return true;
    if (doctorProfileRes.data) return true;
    return false;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);

      if (newSession?.user) {
        isDoctorAccount(newSession.user.id).then(ok => {
          if (!ok) supabase.auth.signOut();
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
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
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const ok = await isDoctorAccount(data.user.id);
      if (!ok) {
        await supabase.auth.signOut();
        return { error: WRONG_ROLE_ERROR };
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
