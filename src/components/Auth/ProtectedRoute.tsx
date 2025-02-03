import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState(() => {
    const cached = localStorage.getItem('is_admin');
    return cached === 'true';
  });
  const [checking, setChecking] = React.useState(true);


  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setChecking(false);
        localStorage.removeItem('is_admin');
        return;
      }

      // Check cached admin status first
      const cachedIsAdmin = localStorage.getItem('is_admin');
      if (cachedIsAdmin) {
        setIsAdmin(cachedIsAdmin === 'true');
        setChecking(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const isAdminUser = adminDoc.exists();
        setIsAdmin(isAdminUser);
        localStorage.setItem('is_admin', isAdminUser.toString());
      } catch (error) {
        setIsAdmin(false);
      }
      setChecking(false);
    };

    checkAdminStatus();
  }, [user]);

  // Show loading while either auth is loading or we're checking admin status
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}