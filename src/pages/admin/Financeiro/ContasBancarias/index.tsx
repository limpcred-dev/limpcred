import React, { useState, useEffect } from 'react';
import { Plus, Building2 } from 'lucide-react';
import ListaContas from './ListaContas';
import FormConta from './FormConta';
import { useAuth } from '../../../../hooks/useAuth';
import { contasBancariasService } from '../../../../services/financeiro';
import { ContaBancaria } from '../../../../types/financeiro';

export default function ContasBancarias() {
  const [showForm, setShowForm] = useState(false);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarContas = async () => {
    if (!user) return;
    
    try {
      const lista = await contasBancariasService.listarPorUsuario(user.uid);
      setContas(lista);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarContas();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Contas Bancárias</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {showForm ? (
        <FormConta 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            carregarContas();
          }}
        />
      ) : (
        <ListaContas 
          contas={contas}
          loading={loading}
        />
      )}
    </div>
  );
}