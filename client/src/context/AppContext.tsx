import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { Profile } from "../lib/types";

interface AppContextValue {
  loading: boolean;
  authenticated: boolean;
  profile: Profile | null;
  login: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    const data = await api.get<Profile | null>("/profile");
    setProfile(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ authenticated: boolean }>("/auth/me");
        setAuthenticated(me.authenticated);
        if (me.authenticated) {
          await refreshProfile();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshProfile]);

  const login = useCallback(
    async (pin: string) => {
      await api.post("/auth/login", { pin });
      setAuthenticated(true);
      await refreshProfile();
    },
    [refreshProfile]
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setAuthenticated(false);
    setProfile(null);
  }, []);

  return (
    <AppContext.Provider value={{ loading, authenticated, profile, login, logout, refreshProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans AppProvider");
  return ctx;
}
