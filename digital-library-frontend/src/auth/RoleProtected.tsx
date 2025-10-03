import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

export default function RoleProtected({
  roles, children,
}: { roles: string[]; children: JSX.Element }) {
  const { user, isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  const ok = roles.includes((user?.role ?? "").toUpperCase());
  return ok ? children : <Navigate to="/401" replace />;
}
