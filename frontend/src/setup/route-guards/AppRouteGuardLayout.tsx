import { useAuthContext } from "@/features/auth/hooks/contexts/useAuthContext";
import { AppLayout } from "@/setup/layout/AppLayout";
import { Navigate } from "react-router";

export function AppRouteGuardLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <AppLayout />;
}
