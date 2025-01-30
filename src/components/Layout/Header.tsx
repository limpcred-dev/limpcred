import React from 'react';
import { User, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { empresaSelecionada } = useEmpresa();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const loadUserName = async () => {
      if (!user) return;
      
      try {
        // Tenta buscar da tabela de admins primeiro
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setUserName(adminDoc.data().name);
          return;
        }

        // Se não encontrar, busca da tabela de users
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().nome);
        }
      } catch (error) {
        console.error('Erro ao carregar nome do usuário:', error);
      }
    };

    loadUserName();
  }, [user]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex flex-col p-3 lg:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between mb-4 lg:mb-0">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-lg font-bold text-gray-900">LimpCred</h1>
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => navigate('/dashboard/configuracoes')}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="lg:flex-1 lg:mx-8">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full px-3 py-2 text-sm lg:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
          />
        </div>
        
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={() => navigate('/selecionar-empresa')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Building2 className="w-5 h-5" />
            <span className="max-w-[150px] truncate">
              {empresaSelecionada?.nomeFantasia || 'Selecionar Empresa'}
            </span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard/configuracoes')}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <span className="font-medium hover:text-blue-600">
              {userName || 'Usuário'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;