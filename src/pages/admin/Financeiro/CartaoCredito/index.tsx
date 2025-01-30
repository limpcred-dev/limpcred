import React, { useState, useEffect } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import ListaCartoes from './ListaCartoes';
import FormCartao from './FormCartao';
import { useAuth } from '../../../../hooks/useAuth';
import { cartoesService } from '../../../../services/financeiro';
import { CartaoCredito } from '../../../../types/financeiro';

export default function GestaoCartoes() {
  const [showForm, setShowForm] = useState(false);
  const [cartaoParaEditar, setCartaoParaEditar] = useState<CartaoCredito | null>(null);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarCartoes = async () => {
    if (!user) return;
    
    try {
      const lista = await cartoesService.listarPorUsuario(user.uid);
      setCartoes(lista);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCartoes();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Cartões de Crédito</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Cartão
        </button>
      </div>

      {showForm ? (
        <FormCartao 
          cartao={cartaoParaEditar}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setCartaoParaEditar(null);
            carregarCartoes();
          }}
        />
      ) : (
        <ListaCartoes 
          cartoes={cartoes}
          loading={loading}
          onEdit={(cartao) => {
            setCartaoParaEditar(cartao);
            setShowForm(true);
          }}
          onDelete={carregarCartoes}
        />
      )}
    </div>
  );
}