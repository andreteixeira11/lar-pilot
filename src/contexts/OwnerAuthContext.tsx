import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OwnerSession {
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyName: string;
  token: string;
}

interface OwnerAuthContextType {
  owner: OwnerSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | undefined>(undefined);

const STORAGE_KEY = "owner_session";

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<OwnerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as OwnerSession;
        // Validate session is not expired
        validateSession(session.token).then(isValid => {
          if (isValid) {
            setOwner(session);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
          setIsLoading(false);
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateSession = async (token: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("owner_sessions")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    
    return !error && !!data;
  };

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Call the verify function
      const { data, error } = await supabase.rpc("verify_owner_login", {
        p_email: email,
        p_password: password,
      });

      if (error) {
        console.error("Login error:", error);
        return { error: "Erro ao verificar credenciais" };
      }

      if (!data || data.length === 0) {
        return { error: "Email ou password incorretos" };
      }

      const ownerData = data[0];

      // Create session token
      const token = crypto.randomUUID() + crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      // Save session to database
      const { error: sessionError } = await supabase
        .from("owner_sessions")
        .insert({
          owner_id: ownerData.owner_id,
          token: token,
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        console.error("Session error:", sessionError);
        return { error: "Erro ao criar sessão" };
      }

      const session: OwnerSession = {
        ownerId: ownerData.owner_id,
        ownerName: ownerData.owner_name,
        propertyId: ownerData.property_id,
        propertyName: ownerData.property_name,
        token: token,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setOwner(session);

      return { error: null };
    } catch (err) {
      console.error("Login exception:", err);
      return { error: "Erro inesperado" };
    }
  };

  const logout = () => {
    if (owner?.token) {
      // Remove session from database
      supabase
        .from("owner_sessions")
        .delete()
        .eq("token", owner.token)
        .then(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setOwner(null);
  };

  return (
    <OwnerAuthContext.Provider value={{ owner, isLoading, login, logout }}>
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth() {
  const context = useContext(OwnerAuthContext);
  if (context === undefined) {
    throw new Error("useOwnerAuth must be used within an OwnerAuthProvider");
  }
  return context;
}
