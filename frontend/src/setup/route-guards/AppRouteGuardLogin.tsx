import { useAuthContext } from "@/features/auth/hooks/contexts/useAuthContext";
import { Navigate, Outlet } from "react-router";

export function AppRouteGuardLogin() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}
