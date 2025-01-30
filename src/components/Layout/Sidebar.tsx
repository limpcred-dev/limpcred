import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart,
  UserPlus,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  ChevronDown,
  Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin } from '../../hooks/useIsAdmin';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev =>
      prev.includes(menu)
        ? prev.filter(item => item !== menu)
        : [...prev, menu]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="bg-gradient-to-b from-primary to-primary-dark text-white w-64 h-full flex flex-col">
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3 py-6">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">LimpCred</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/dashboard') 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Visão Geral</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/meus-clientes"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/dashboard/meus-clientes')
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users size={20} />
              <span>Meus Clientes</span>
            </Link>
          </li>
          {user?.tipo !== 'vendedor' && <li>
            <button
              onClick={() => toggleMenu('cadastros')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center space-x-2">
                <UserPlus size={20} />
                <span>Cadastros</span>
              </div>
              <ChevronDown
                size={16}
                className={`transform transition-transform ${
                  openMenus.includes('cadastros') ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openMenus.includes('cadastros') && (
              <ul className="mt-2 ml-6 space-y-2">
                <li>
                  <Link
                    to="/dashboard/cadastros/usuarios" 
                    className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all ${
                      isActive('/dashboard/cadastros/usuarios')
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Usuários
                  </Link>
                </li>
              </ul>
            )}
          </li>}
          <li>
            <Link
              to="/dashboard/processos"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/dashboard/processos')
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText size={20} />
              <span>Processos</span>
            </Link>
          </li>
          {user?.tipo !== 'vendedor' && <li>
            <Link
              to="/dashboard/todos-processos"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/dashboard/todos-processos')
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText size={20} />
              <span>Todos Processos</span>
            </Link>
          </li>}
          <li>
            <Link
              to="/dashboard/relatorios"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive('/dashboard/relatorios')
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart size={20} />
              <span>Relatórios</span>
            </Link>
          </li>
          <li>
            <Link
              onClick={() => toggleMenu('financeiro')}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                isActive('/dashboard/financeiro') || isActive('/dashboard/financeiro/faturas')
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <DollarSign size={20} />
                <span>Financeiro</span>
              </div>
              <ChevronDown
                size={16}
                className={`transform transition-transform ${
                  openMenus.includes('financeiro') ? 'rotate-180' : ''
                }`}
              />
            </Link>
            {openMenus.includes('financeiro') && (
              <ul className="mt-2 ml-6 space-y-2">
                <li>
                  <Link
                    to="/dashboard/financeiro"
                    className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all ${
                      isActive('/dashboard/financeiro') && !isActive('/dashboard/financeiro/faturas')
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Visão Geral
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/financeiro/faturas"
                    className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-all ${
                      isActive('/dashboard/financeiro/faturas')
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Faturas
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg 
                     text-red-300 hover:bg-red-500/10 hover:text-red-200 
                     transition-all"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;