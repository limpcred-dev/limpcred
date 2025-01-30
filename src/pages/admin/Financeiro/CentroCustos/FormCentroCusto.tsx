import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEmpresa } from '../../../../contexts/EmpresaContext';
import { centroCustosService } from '../../../../services/financeiro';
import { CentroCusto, CentroCustoCreate } from '../../../../types/financeiro';
import { formataMoeda } from '../../../../utils/formatadores';
import { useAuth } from '../../../../hooks/useAuth';

interface FormCentroCustoProps {
  centroCusto?: CentroCusto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormCentroCusto({ centroCusto, onClose, onSuccess }: FormCentroCustoProps) {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [centrosPai, setCentrosPai] = useState<CentroCusto[]>([]);
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState<CentroCustoCreate>({
    nome: centroCusto?.nome || '',
    tipo: centroCusto?.tipo || 'despesa',
    empresaId: empresaSelecionada?.id || '',
    descricao: centroCusto?.descricao || '',
    centroPaiId: centroCusto?.centroPaiId || '',
    orcamento: centroCusto?.orcamento || 0,
    userId: user?.uid || '',
    status: centroCusto?.status || 'ativo'
  });

  useEffect(() => {
    const carregarCentrosPai = async () => {
      if (!user) return;
      setInitialized(true);
      try {
        const lista = await centroCustosService.listarPorUsuario(user.uid);
        // Filtra para não mostrar o próprio centro como pai se estiver editando
        setCentrosPai(lista.filter(c => c.id !== centroCusto?.id));
      } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
        setCentrosPai([]);
      }
    };

    carregarCentrosPai();
  }, [user, centroCusto]);

  if (!initialized) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    if (!formData.nome || !formData.tipo) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dadosParaSalvar = {
        ...formData,
        orcamento: Number(formData.orcamento) || 0,
        status: formData.status || 'ativo'
      };

      if (centroCusto) {
        await centroCustosService.atualizar(centroCusto.id, dadosParaSalvar);
      } else {
        await centroCustosService.criar(dadosParaSalvar);
      }
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar centro de custo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar centro de custo. Tente novamente.');
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
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'receita' | 'despesa' })}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Centro de Custo Pai</label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.centroPaiId}
          onChange={(e) => setFormData({ ...formData, centroPaiId: e.target.value })}
        >
          <option value="">Nenhum (Principal)</option>
          {centrosPai.map((centro) => (
            <option key={centro.id} value={centro.id}>
              {centro.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Orçamento Mensal</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.orcamento}
          onChange={(e) => setFormData({ ...formData, orcamento: parseFloat(e.target.value) })}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.orcamento > 0 && `Valor em reais: ${formataMoeda(formData.orcamento)}`}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' })}
        > 
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
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
          {loading ? 'Salvando...' : centroCusto ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}