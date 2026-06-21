// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchCustomerProfile, fetchEmployeeProfile, signOut as authSignOut } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(nextSession) {
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    const userType = nextSession.user.user_metadata?.user_type;

    if (userType === "employee") {
      const employee = await fetchEmployeeProfile(nextSession.user.id);
      setProfile(employee);
      return;
    }

    if (userType === "customer") {
      const customerId = nextSession.user.user_metadata?.customer_id || nextSession.user.id;
      const customer = await fetchCustomerProfile(customerId);
      setProfile(customer);
      return;
    }

    setProfile(null);
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session ?? null);
        await loadProfile(data.session ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession ?? null);
      await loadProfile(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await authSignOut();
    setSession(null);
    setProfile(null);
  }

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      authenticated: !!session,
      isEmployee: profile?.type === "employee",
      isCustomer: profile?.type === "customer",
      logout,
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}