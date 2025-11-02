import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: "free" | "basic" | "premium" | null;
  subscriptionStatus: "active" | "cancelled" | "expired" | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, plan?: "free" | "basic" | "premium") => Promise<void>;
  logout: () => void;
  updateSubscription: (plan: "basic" | "premium") => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Connect to MySQL backend
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      subscriptionPlan: "free",
      subscriptionStatus: null,
    };
    
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, name: string, plan: "free" | "basic" | "premium" = "free") => {
    // TODO: Connect to MySQL backend
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mockUser: User = {
      id: "1",
      email,
      name,
      subscriptionPlan: plan,
      subscriptionStatus: plan !== "free" ? "active" : null,
    };
    
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateSubscription = (plan: "basic" | "premium") => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      subscriptionPlan: plan,
      subscriptionStatus: "active" as const,
    };
    
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateSubscription,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
