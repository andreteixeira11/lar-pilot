import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentBlockOverlay } from "./PaymentBlockOverlay";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if subscription is pending/overdue
  const subscriptionStatus = profile?.subscription_status;
  const isPendingPayment = subscriptionStatus === "pending" || subscriptionStatus === "overdue";

  return (
    <>
      {isPendingPayment && <PaymentBlockOverlay />}
      <div className={isPendingPayment ? "pointer-events-none select-none blur-sm" : ""}>
        {children}
      </div>
    </>
  );
}
