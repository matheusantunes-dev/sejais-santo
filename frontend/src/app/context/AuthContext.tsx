import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";

interface AuthContextValue {
  session: Session | null | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    const s = data.session;
    if (s?.access_token) {
      try {
        const p = JSON.parse(atob(s.access_token.split('.')[1]));
        console.log('[Auth] getSession token exp:', new Date(p.exp * 1000).toISOString(), 'now:', new Date().toISOString(), 'expired:', p.exp < Math.floor(Date.now() / 1000));
      } catch (_) {}
    }
    setSession(s ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('[Auth] event:', event, 'hasSession:', !!session, 'tokenExp:', session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A');
      setSession(session);
    }
  );

  return () => {
    listener?.subscription?.unsubscribe?.();
  };
}, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};