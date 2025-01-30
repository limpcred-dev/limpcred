import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useEmpresa } from '../../../../contexts/EmpresaContext';
import { contasBancariasService } from '../../../../services/financeiro';
import { ContaBancariaCreate } from '../../../../types/financeiro';

interface FormContaProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormConta({ onClose, onSuccess }: FormContaProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ContaBancariaCreate>({
    banco: '', 
    agencia: '', 
    conta: '', 
    tipo: 'corrente',
    saldoInicial: 0,
    saldoAtual: 0,
    userId: user?.uid || '',
    status: 'ativo'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    if (!formData.banco || !formData.agencia || !formData.conta) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dadosParaSalvar = {
        ...formData,
        saldoAtual: Number(formData.saldoInicial) || 0,
        saldoInicial: Number(formData.saldoInicial) || 0
      };

      await contasBancariasService.criar(dadosParaSalvar);
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar conta bancária:', err);
      setError('Erro ao salvar conta bancária. Tente novamente.');
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
          <label className="block text-sm font-medium text-gray-700">Banco</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.banco}
            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Agência</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.agencia}
              onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Conta</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.conta}
              onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Conta</label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" 
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <option value="corrente">Conta Corrente</option>
            <option value="poupanca">Conta Poupança</option>
            <option value="investimento">Conta Investimento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Saldo Inicial</label>
          <input
            type="number" 
            step="0.01" 
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.saldoInicial || ''}
            onChange={(e) => setFormData({ ...formData, saldoInicial: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
    </form>
  );
}