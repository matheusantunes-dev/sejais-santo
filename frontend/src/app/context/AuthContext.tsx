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
    setSession(data.session ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_, session) => {
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