import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { faturasService } from '../../../../services/financeiro';
import { Fatura } from '../../../../types/financeiro';
import { formataMoeda } from '../../../../utils/formatadores';

interface FormFaturaProps {
  fatura: Fatura;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormFatura({ fatura, onClose, onSuccess }: FormFaturaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    valor: fatura.valor,
    dataVencimento: fatura.dataVencimento.toISOString().split('T')[0],
    status: fatura.status,
    observacoes: fatura.observacoes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await faturasService.atualizar(fatura.id, {
        valor: formData.valor,
        dataVencimento: new Date(formData.dataVencimento),
        status: formData.status as 'pendente' | 'pago' | 'atrasado' | 'cancelado',
        observacoes: formData.observacoes,
        dataPagamento: formData.status === 'pago' ? new Date() : undefined
      });
      onSuccess();
    } catch (err) {
      console.error('Erro ao atualizar fatura:', err);
      setError('Erro ao atualizar fatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Editar Fatura
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
            value={fatura.clienteNome}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parcela
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
            value={`${fatura.numeroParcela}/${fatura.totalParcelas}`}
            disabled
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.valor > 0 && formataMoeda(formData.valor)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data de Vencimento
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.dataVencimento}
            onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="atrasado">Atrasado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.observacoes}
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
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}