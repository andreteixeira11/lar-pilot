import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OwnerProperty {
  id: string;
  name: string;
  address: string;
}

interface OwnerSession {
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyName: string;
  token: string;
  properties: OwnerProperty[];
}

interface OwnerAuthContextType {
  owner: OwnerSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  switchProperty: (propertyId: string) => void;
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
            // Reload properties to get latest list
            loadOwnerProperties(session.ownerId).then(properties => {
              const updatedSession = { ...session, properties };
              setOwner(updatedSession);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
            });
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
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/owner-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ action: 'validate', token }),
        }
      );
      const data = await response.json();
      return data.valid === true;
    } catch {
      return false;
    }
  };

  const loadOwnerProperties = async (ownerId: string): Promise<OwnerProperty[]> => {
    // First get the legacy property from property_owners
    const { data: ownerData } = await supabase
      .from("property_owners")
      .select("property_id, properties(id, name, address)")
      .eq("id", ownerId)
      .single();

    // Then get properties from junction table
    const { data: junctionData } = await supabase
      .from("owner_properties")
      .select("property_id, properties(id, name, address)")
      .eq("owner_id", ownerId);

    const propertiesMap = new Map<string, OwnerProperty>();

    // Add legacy property if exists
    if (ownerData?.properties) {
      const prop = ownerData.properties as any;
      propertiesMap.set(prop.id, {
        id: prop.id,
        name: prop.name,
        address: prop.address
      });
    }

    // Add properties from junction table
    if (junctionData) {
      junctionData.forEach((item: any) => {
        if (item.properties) {
          propertiesMap.set(item.properties.id, {
            id: item.properties.id,
            name: item.properties.name,
            address: item.properties.address
          });
        }
      });
    }

    return Array.from(propertiesMap.values());
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

      // Load all properties for this owner
      const properties = await loadOwnerProperties(ownerData.owner_id);

      // Create session token
      const token = crypto.randomUUID() + crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      // Save session via edge function
      const sessionResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/owner-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ action: 'create', owner_id: ownerData.owner_id, token, expires_at: expiresAt.toISOString() }),
        }
      );
      const sessionResult = await sessionResponse.json();

      if (!sessionResponse.ok || sessionResult.error) {
        console.error("Session error:", sessionResult.error);
        return { error: "Erro ao criar sessão" };
      }

      const session: OwnerSession = {
        ownerId: ownerData.owner_id,
        ownerName: ownerData.owner_name,
        propertyId: ownerData.property_id,
        propertyName: ownerData.property_name,
        token: token,
        properties: properties.length > 0 ? properties : [{
          id: ownerData.property_id,
          name: ownerData.property_name,
          address: ""
        }],
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
      // Remove session via edge function
      fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/owner-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ action: 'delete', token: owner.token }),
        }
      ).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setOwner(null);
  };

  const switchProperty = (propertyId: string) => {
    if (!owner) return;
    
    const selectedProperty = owner.properties.find(p => p.id === propertyId);
    if (selectedProperty) {
      const updatedSession: OwnerSession = {
        ...owner,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
      setOwner(updatedSession);
    }
  };

  return (
    <OwnerAuthContext.Provider value={{ owner, isLoading, login, logout, switchProperty }}>
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
