import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { centroCustosService, receitasService } from '../../../../services/financeiro';
import { CentroCusto, ReceitaCreate } from '../../../../types/financeiro';
import { formataMoeda } from '../../../../utils/formatadores';

interface FormReceitaProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormReceita({ onClose, onSuccess }: FormReceitaProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);

  const [formData, setFormData] = useState<ReceitaCreate>({
    descricao: '',
    valor: 0,
    data: new Date(),
    centroCustoId: '',
    userId: user?.uid || '',
    status: 'ativo',
  });

  useEffect(() => {
    const carregarCentrosCusto = async () => {
      if (!user) return;
      setError('');

      try {
        const lista = await centroCustosService.listarPorUsuario(user.uid);
        const centrosReceita = lista.filter(c => 
          c.tipo === 'receita' && 
          c.status === 'ativo'
        );
        setCentrosCusto(centrosReceita);
      } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
        setError('Erro ao carregar centros de custo');
      }
    };

    carregarCentrosCusto();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não identificado');
      return;
    }

    if (!formData.centroCustoId) {
      setError('Selecione um centro de custo');
      return;
    }

    if (formData.valor <= 0) {
      setError('O valor deve ser maior que zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await receitasService.criar({
        ...formData,
        userId: user.uid,
      });
      onSuccess();
    } catch (err) {
      console.error('Erro ao criar receita:', err);
      setError('Erro ao criar receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Centro de Custo</label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.centroCustoId}
          onChange={(e) => setFormData({ ...formData, centroCustoId: e.target.value })}
        >
          <option value="">Selecione...</option>
          {centrosCusto.map((centro) => (
            <option key={centro.id} value={centro.id}>
              {centro.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Valor</label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.valor || ''}
          onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.valor > 0 && `Valor em reais: ${formataMoeda(formData.valor)}`}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data</label>
        <input
          type="date"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.data instanceof Date ? formData.data.toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, data: new Date(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observações</label>
        <textarea
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
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
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Criar Receita'}
        </button>
      </div>
    </form>
  );
}