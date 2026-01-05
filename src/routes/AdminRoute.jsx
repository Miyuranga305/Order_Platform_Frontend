
import { Navigate } from "react-router-dom";
import { useMe } from "../auth/useMe";
export default function AdminRoute({ children }) {
  const { me, loading } = useMe();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!me || me.role !== "ADMIN") return <Navigate to="/orders" replace />;
  return children;
}
