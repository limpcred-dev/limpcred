import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
    <BrowserRouter>
      <AuthProvider>
        <EmpresaProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/selecionar-empresa" element={<EmpresaSelection />} />
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
          </Routes>
        </EmpresaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;