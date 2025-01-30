import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { empresasService } from '../services/empresas';
import { Empresa } from '../types/empresa';

interface EmpresaContextType {
  empresas: Empresa[];
  empresaSelecionada: Empresa | null;
  selecionarEmpresa: (empresa: Empresa) => void;
  loading: boolean;
  error: string | null;
}

export const EmpresaContext = createContext<EmpresaContextType | null>(null);

interface EmpresaProviderProps {
  children: ReactNode;
}

export function EmpresaProvider({ children }: EmpresaProviderProps) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to select company
  const selecionarEmpresa = (empresa: Empresa) => {
    setEmpresaSelecionada(empresa);
    localStorage.setItem('empresaSelecionada', empresa.id);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setEmpresas([]);
      setEmpresaSelecionada(null);
      return;
    }

    const carregarEmpresas = async () => {
      try {
        let listaEmpresas = [];
        
        // Verifica se é admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          listaEmpresas = await empresasService.listarPorAdmin(user.uid);
        } else {
          // Se for usuário comum, busca apenas a empresa dele
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const empresaDoc = await getDoc(doc(db, 'empresas', userData.empresaId));
            if (empresaDoc.exists()) {
              listaEmpresas = [{ id: empresaDoc.id, ...empresaDoc.data() }];
              // Auto-select the company for regular users
              selecionarEmpresa({ id: empresaDoc.id, ...empresaDoc.data() } as Empresa);
            }
          }
        }
        
        setEmpresas(listaEmpresas);

        // Only try to recover from localStorage for admin users
        if (adminDoc.exists()) {
          const empresaSalvaId = localStorage.getItem('empresaSelecionada');
          if (empresaSalvaId) {
            const empresaSalva = listaEmpresas.find(e => e.id === empresaSalvaId);
            if (empresaSalva) {
              selecionarEmpresa(empresaSalva);
            }
          }
        }
      } catch (err) {
        setError('Erro ao carregar empresas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregarEmpresas();
  }, [user]);

  return (
    <EmpresaContext.Provider
      value={{
        empresas,
        empresaSelecionada,
        selecionarEmpresa,
        loading,
        error
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de um EmpresaProvider');
  }
  return context;
}