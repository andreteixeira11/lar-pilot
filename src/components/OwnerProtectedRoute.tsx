import { Navigate } from "react-router-dom";
import { useOwnerAuth } from "@/contexts/OwnerAuthContext";

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

export function OwnerProtectedRoute({ children }: OwnerProtectedRouteProps) {
  const { owner, isLoading } = useOwnerAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (!owner) {
    return <Navigate to="/proprietario/login" replace />;
  }

  return <>{children}</>;
}
