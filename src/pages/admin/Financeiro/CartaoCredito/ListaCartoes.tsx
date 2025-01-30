import React, { useState } from 'react';
import { CreditCard, Edit2, Trash2 } from 'lucide-react';
import { formataMoeda } from '../../../../utils/formatadores';
import { CartaoCredito } from '../../../../types/financeiro';
import { cartoesService } from '../../../../services/financeiro';

interface ListaCartoesProps {
  cartoes: CartaoCredito[];
  loading: boolean;
  onEdit: (cartao: CartaoCredito) => void;
  onDelete: () => void;
}

export default function ListaCartoes({ cartoes, loading, onEdit, onDelete }: ListaCartoesProps) {
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await cartoesService.excluir(id);
        onDelete();
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
        alert('Erro ao excluir cartão. Tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cartoes.map((cartao) => (
          <div
            key={cartao.id}
            className="relative rounded-lg p-6"
            style={{ backgroundColor: cartao.cor, color: '#fff' }}
          >
            <div className="flex justify-between items-start mb-8">
              <CreditCard className="w-8 h-8" />
              <div className="flex space-x-2">
                <button 
                  onClick={() => onEdit(cartao)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(cartao.id)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{cartao.nome}</h3>
                <p className="text-sm opacity-80 capitalize">{cartao.bandeira}</p>
              </div>

              <div>
                <p className="text-sm opacity-80">Limite</p>
                <p className="text-lg font-semibold">{formataMoeda(cartao.limite)}</p>
              </div>

              <div className="flex justify-between text-sm opacity-80">
                <div>
                  <p className="opacity-80">Fechamento</p>
                  <p>Dia {cartao.diaFechamento}</p>
                </div>
                <div>
                  <p className="opacity-80">Vencimento</p>
                  <p>Dia {cartao.diaVencimento}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {cartoes.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhum cartão cadastrado
          </div>
        )}
      </div>
    </div>
  );
}