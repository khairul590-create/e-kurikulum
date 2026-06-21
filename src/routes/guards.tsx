import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PageLoader } from "@/components/ui/Misc";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RoleGate({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
