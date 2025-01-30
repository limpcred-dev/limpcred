import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { usuariosService } from '../../../services/usuarios';
import { processosService } from '../../../services/processos';
import { formataMoeda } from '../../../utils/formatadores';
import { Processo, ProcessoCreate } from '../../../types/processo';
import { Usuario } from '../../../types/usuario';

interface FormProcessoProps {
  processo?: Processo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormProcesso({ processo, onClose, onSuccess }: FormProcessoProps) {
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [vendedores, setVendedores] = useState<Usuario[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingVendedores, setLoadingVendedores] = useState(true);

  const [formData, setFormData] = useState<ProcessoCreate>({
    tipo: processo?.tipo || 'limpeza',
    clienteId: processo?.clienteId || '',
    cliente: processo?.cliente || '',
    descricao: processo?.descricao || '',
    valor: processo?.valor || 0,
    responsavelId: processo?.responsavelId || '',
    responsavel: processo?.responsavel || '',
    dataVencimento: processo?.dataVencimento || new Date(),
    observacoes: processo?.observacoes || '',
    empresaId: empresaSelecionada?.id || ''
  });

  useEffect(() => {
    const carregarClientes = async () => {
      if (!empresaSelecionada) return;
      
      try {
        const lista = await usuariosService.listarPorEmpresaETipo(
          empresaSelecionada.id,
          'cliente'
        );
        setClientes(lista);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        setError('Erro ao carregar lista de clientes');
      } finally {
        setLoadingClientes(false);
      }
    };

    carregarClientes();
  }, [empresaSelecionada]);

  useEffect(() => {
    const carregarVendedores = async () => {
      if (!empresaSelecionada) return;
      
      try {
        const lista = await usuariosService.listarPorEmpresaETipo(
          empresaSelecionada.id,
          'vendedor'
        );
        setVendedores(lista);
      } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
        setError('Erro ao carregar lista de vendedores');
      } finally {
        setLoadingVendedores(false);
      }
    };

    carregarVendedores();
  }, [empresaSelecionada]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaSelecionada) {
      setError('Selecione uma empresa primeiro');
      return;
    }

    if (!formData.clienteId || !formData.responsavelId) {
      setError('Selecione o cliente e o responsável');
      return;
    }

    if (formData.valor <= 0) {
      setError('O valor deve ser maior que zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (processo) {
        await processosService.atualizar(processo.id, formData);
      } else {
        await processosService.criar(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar processo:', err);
      setError(`Erro ao ${processo ? 'atualizar' : 'criar'} processo. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Processo
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
          >
            <option value="limpeza">Limpeza de Nome</option>
            <option value="analise">Análise de Crédito</option>
            <option value="contestacao">Contestação</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={loadingClientes}
            value={formData.clienteId}
            onChange={(e) => {
              const cliente = clientes.find(c => c.id === e.target.value);
              setFormData({ 
                ...formData, 
                clienteId: e.target.value,
                cliente: cliente?.nome || ''
              });
            }}
          >
            <option value="">
              {loadingClientes ? 'Carregando...' : 'Selecione...'}
            </option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          required
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            required
            min="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.valor || ''}
            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Responsável
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={loadingVendedores}
            value={formData.responsavelId}
            onChange={(e) => {
              const vendedor = vendedores.find(v => v.id === e.target.value);
              setFormData({ 
                ...formData, 
                responsavelId: e.target.value,
                responsavel: vendedor?.nome || ''
              });
            }}
          >
            <option value="">
              {loadingVendedores ? 'Carregando...' : 'Selecione...'}
            </option>
            {vendedores.map((vendedor) => (
              <option key={vendedor.id} value={vendedor.id}>
                {vendedor.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data de Vencimento
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.dataVencimento instanceof Date ? formData.dataVencimento.toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, dataVencimento: new Date(e.target.value) })}
          />
        </div>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : processo ? 'Atualizar' : 'Criar Processo'}
        </button>
      </div>
    </form>
  );
}