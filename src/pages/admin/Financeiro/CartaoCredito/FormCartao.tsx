import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { cartoesService } from '../../../../services/financeiro';
import { CartaoCreditoCreate } from '../../../../types/financeiro';

interface FormCartaoProps {
  cartao?: CartaoCredito;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormCartao({ cartao, onClose, onSuccess }: FormCartaoProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CartaoCreditoCreate>({
    nome: cartao?.nome || '', 
    bandeira: cartao?.bandeira || 'visa',
    limite: cartao?.limite || 0,
    diaFechamento: cartao?.diaFechamento || 1,
    diaVencimento: cartao?.diaVencimento || 1,
    cor: cartao?.cor || '#1E40AF',
    userId: user?.uid || '',
    status: cartao?.status || 'ativo'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    if (!formData.nome || !formData.bandeira) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dadosParaSalvar = {
        ...formData,
        limite: Number(formData.limite) || 0
      };

      if (cartao) {
        await cartoesService.atualizar(cartao.id, dadosParaSalvar);
      } else {
        await cartoesService.criar(dadosParaSalvar);
      }
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar cartão:', err);
      setError('Erro ao salvar cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do Cartão</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bandeira</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.bandeira}
            onChange={(e) => setFormData({ ...formData, bandeira: e.target.value })}
            required
          >
            <option value="">Selecione...</option>
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="elo">Elo</option>
            <option value="amex">American Express</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Limite</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.limite}
            onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dia do Fechamento</label>
            <input
              type="number"
              min="1"
              max="31"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.diaFechamento}
              onChange={(e) => setFormData({ ...formData, diaFechamento: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dia do Vencimento</label>
            <input
              type="number"
              min="1"
              max="31"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.diaVencimento}
              onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cor do Cartão</label>
          <input
            type="color"
            className="mt-1 block w-full"
            value={formData.cor}
            onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {cartao ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}