// src/components/ProtectedAdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore"; // <-- ensure this matches your export

export default function ProtectedAdminRoute({ children }) {
  // MUST call the hook at top-level of the component body (not inside ifs)
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const authUser = useAuthStore((s) => s.authUser);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);

  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // call checkAuth once on mount to populate authUser (cookie-based)
    (async () => {
      try {
        await checkAuth();
      } catch (err) {
        // ignore, checkAuth handles errors
      } finally {
        if (mounted) {
          setLocalLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [checkAuth]);

  if (isCheckingAuth || localLoading) return <div>Loading...</div>;

  // If there's no user or not admin -> redirect
  if (!authUser || authUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
