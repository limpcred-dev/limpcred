import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, UserPlus } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import MobileNavItem from '../components/Layout/MobileNavItem';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 lg:flex-row relative">
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-50">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col lg:pl-64">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around bg-white border-t border-gray-200 p-3">
          <MobileNavItem icon={LayoutDashboard} label="Início" to="/dashboard" />
          <MobileNavItem icon={Users} label="Meus Clientes" to="/dashboard/meus-clientes" />
          <MobileNavItem icon={FileText} label="Processos" to="/dashboard/processos" />
          {user?.tipo !== 'vendedor' && (
            <MobileNavItem icon={UserPlus} label="Usuários" to="/dashboard/cadastros/usuarios" />
          )}
          <MobileNavItem icon={Settings} label="Config" to="/dashboard/configuracoes" />
        </nav>
      </div>
    </div>
  );
}