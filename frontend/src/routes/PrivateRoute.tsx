import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const { token, loading } = useAuth();

  if (loading) return <div>Caricamento...</div>;

  return token ? children : <Navigate to="/login" replace />;
}
