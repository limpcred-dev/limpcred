import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EmpresaProvider } from './contexts/EmpresaContext';
import DashboardRoute from './components/Auth/DashboardRoute';
import Processos from './pages/vendedor/Processos';
import AdminRoute from './components/Auth/AdminRoute';
import AdminDashboard from './pages/admin/Dashboard';
import Home from './pages/Home';
import EmpresaSelection from './pages/EmpresaSelection';
import AdminLayout from './layouts/AdminLayout';
import Overview from './pages/admin/Overview';
import VendedorDashboard from './pages/vendedor/Dashboard/index';
import MeusClientes from './pages/vendedor/MeusClientes';
import TodosProcessos from './pages/admin/TodosProcessos';
import Clientes from './pages/admin/Clientes';
import Financeiro from './pages/admin/Financeiro';
import Configuracoes from './pages/admin/Configuracoes';
import Usuarios from './pages/admin/Usuarios';
import Relatorios from './pages/admin/Relatorios';
import Faturas from './pages/admin/Financeiro/Faturas';
import Empresas from './pages/admin/Empresas';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter basename="/">
      <AuthProvider>
        <EmpresaProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/selecionar-empresa" element={<EmpresaSelection />} />
            <Route path="/404" element={<div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Página não encontrada</p>
                <a href="/" className="text-primary hover:text-primary-dark">
                  Voltar para o início
                </a>
              </div>
            </div>} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
              <Route 
                index 
                element={
                  <DashboardRoute />
                } 
              />
              <Route path="meus-clientes" element={<MeusClientes />} />
              <Route path="todos-processos" element={<TodosProcessos />} />
              <Route 
                path="empresas" 
                element={
                  <AdminRoute>
                    <ProtectedRoute>
                      <Empresas />
                    </ProtectedRoute>
                  </AdminRoute>
                } 
              />
              <Route path="clientes" element={<Clientes />} />
              <Route path="processos" element={<Processos />} />
              <Route path="cadastros/usuarios" element={<Usuarios />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="financeiro">
                <Route index element={<Financeiro />} />
                <Route path="faturas" element={<Faturas />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </EmpresaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;