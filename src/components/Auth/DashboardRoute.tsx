import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from '../../pages/admin/Dashboard/index';
import VendedorDashboard from '../../pages/vendedor/Dashboard/index';
import ProtectedRoute from './ProtectedRoute';

export default function DashboardRoute() {
  const { user } = useAuth();
  const isVendedor = user?.tipo === 'vendedor';

  return (
    <ProtectedRoute>
      {user?.tipo === 'admin' ? (
        <AdminDashboard />
      ) : isVendedor ? (
        <VendedorDashboard />
      ) : (
        <div className="p-6">
          <p className="text-red-600">Tipo de usuário não suportado</p>
        </div>
      )}
    </ProtectedRoute>
  );
}