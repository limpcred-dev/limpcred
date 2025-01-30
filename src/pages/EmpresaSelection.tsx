import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { useEmpresa } from '../contexts/EmpresaContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

export default function EmpresaSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { empresas, selecionarEmpresa, loading } = useEmpresa();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleEmpresaSelect = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    if (empresa) {
      selecionarEmpresa(empresa);
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Selecione uma Empresa</h1>
          {isAdmin && (
            <button
              onClick={() => navigate('/dashboard/empresas')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nova Empresa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              onClick={() => handleEmpresaSelect(empresa.id)}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{empresa.nomeFantasia}</h3>
                  <p className="text-sm text-gray-500">{empresa.cnpj}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {empresa.endereco.cidade}, {empresa.endereco.estado}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}