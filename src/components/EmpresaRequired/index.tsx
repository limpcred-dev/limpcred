import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import FormEmpresa from '../../pages/admin/Empresas/FormEmpresa';

export default function EmpresaRequired({ children }: { children: React.ReactNode }) {
  const { empresas, loading } = useEmpresa();
  const { user } = useAuth();
  const [showForm, setShowForm] = React.useState(false);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [checkingAdmin, setCheckingAdmin] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  React.useEffect(() => {
    // If no companies are available, redirect to company selection
    if (!loading && empresas.length === 0) {
      navigate('/selecionar-empresa');
    }
  }, [loading, empresas, navigate]);
  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (empresas.length === 0 && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao LimpCred
          </h2>
          
          <p className="text-gray-600 mb-6">
            Para começar, você precisa cadastrar sua primeira empresa.
            Isso nos ajudará a organizar seus dados de forma eficiente.
          </p>

          {showForm ? (
            <FormEmpresa onClose={() => setShowForm(false)} />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Empresa
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}