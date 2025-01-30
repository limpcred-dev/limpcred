import React, { useState, useEffect } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { processosService } from '../../../services/processos';
import { ProcessoCreate, MetodoPagamento } from '../../../types/processo';
import { Cliente } from '../../../types/cliente';
import { formataMoeda } from '../../../utils/formatadores';

interface FormProcessoProps {
  processo?: Processo | null;
  clientes: Cliente[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function FormProcesso({ processo, clientes, onSuccess, onClose }: FormProcessoProps) {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ProcessoCreate>({
    nome: processo?.nome || '',
    clienteId: processo?.clienteId || '',
    clienteNome: processo?.clienteNome || '',
    clienteDocumento: processo?.clienteDocumento || '',
    vendedorId: user?.uid || '',
    empresaId: empresaSelecionada?.id || '',
    metodoPagamento: processo?.metodoPagamento || 'pix',
    valor: processo?.valor || 0,
    valorEntrada: processo?.valorEntrada || 0,
    numeroParcelas: processo?.numeroParcelas || 1,
    dataGarantia: processo?.dataGarantia,
    observacoes: processo?.observacoes || ''
  });
  
  const [valorParcela, setValorParcela] = useState(0);
  const [valorRestante, setValorRestante] = useState(0);

  const tiposProcesso = [
    'LIMPA NOME',
    'RATING DE CRÉDITO',
    'BACEN',
    'REDUÇÃO DE DÉBITOS PGFN'
  ];

  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  
  // Calcula valores quando o total, entrada ou número de parcelas mudam
  useEffect(() => {
    const restante = formData.valor - formData.valorEntrada;
    setValorRestante(restante);
    setValorParcela(restante > 0 ? restante / formData.numeroParcelas : 0);
  }, [formData.valor, formData.valorEntrada, formData.numeroParcelas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !empresaSelecionada) {
      setError('Usuário ou empresa não identificados');
      return;
    }

    if (!formData.clienteId || !formData.nome) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.valor <= 0) {
      setError('O valor total deve ser maior que zero');
      return;
    }

    if (formData.valorEntrada > formData.valor) {
      setError('O valor da entrada não pode ser maior que o valor total');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processoData = {
        ...formData,
        vendedorId: user.uid,
        empresaId: empresaSelecionada.id
      };

      if (processo) {
        await processosService.atualizar(processo.id, processoData);
      } else {
        await processosService.criar(
          processoData,
          contratoFile || undefined,
          comprovanteFile || undefined
        );
      }
      onSuccess();
    } catch (err) {
      console.error('Erro ao criar processo:', err);
      setError('Erro ao criar processo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSelect = (clienteId: string) => {
    // Only find clients from the current company
    const cliente = clientes.filter(c => c.empresaId === empresaSelecionada?.id)
                         .find(c => c.id === clienteId);
    if (cliente) {
      // Get first name of the client
      const primeiroNome = cliente.nome.split(' ')[0];
      
      setFormData(prev => ({
        ...prev,
        clienteId,
        clienteNome: cliente.nome,
        clienteDocumento: cliente.documento,
        nome: prev.nome ? `${prev.nome} - ${primeiroNome}` : '' // Update process name if tipo is selected
      }));
    }
  };

  const handleTipoSelect = (tipo: string) => {
    const cliente = clientes.find(c => c.id === formData.clienteId);
    const primeiroNome = cliente ? cliente.nome.split(' ')[0] : '';
    
    setFormData(prev => ({
      ...prev,
      nome: primeiroNome ? `${tipo} - ${primeiroNome}` : tipo
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente</label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.clienteId}
          onChange={(e) => handleClienteSelect(e.target.value)}
        >
          <option value="">Selecione um cliente...</option>
          {clientes.filter(c => c.empresaId === empresaSelecionada?.id).map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo do Processo</label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.nome.split(' - ')[0] || ''}
          onChange={(e) => handleTipoSelect(e.target.value)}
        >
          <option value="">Selecione o tipo do processo...</option>
          {tiposProcesso.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor Total</label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.valor || ''}
            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor da Entrada</label>
          <input
            type="number"
            required
            min="0.01"
            max={formData.valor || 0}
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.valorEntrada || ''}
            onChange={(e) => setFormData({ ...formData, valorEntrada: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data de Garantia</label>
        <input
          type="date"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={formData.dataGarantia instanceof Date ? formData.dataGarantia.toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, dataGarantia: e.target.value ? new Date(e.target.value) : undefined })}
        />
        <p className="mt-1 text-sm text-gray-500">
          Data limite da garantia do processo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Método de Pagamento</label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.metodoPagamento}
            onChange={(e) => setFormData({ ...formData, metodoPagamento: e.target.value as MetodoPagamento })}
          >
            <option value="pix">PIX</option>
            <option value="cartao">Cartão de Crédito</option>
            <option value="boleto">Boleto</option>
            <option value="transferencia">Transferência</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Número de Parcelas</label>
          <input
            type="number"
            required
            min={1}
            max={12}
            step="1"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.numeroParcelas || ''}
            onChange={(e) => setFormData({ ...formData, numeroParcelas: parseInt(e.target.value) })}
            disabled={valorRestante <= 0}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Valor Total:</span>
          <span className="text-gray-900">{formataMoeda(formData.valor)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Valor da Entrada:</span>
          <span className="text-gray-900">{formataMoeda(formData.valorEntrada)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Valor Restante:</span>
          <span className="text-gray-900">{formataMoeda(valorRestante)}</span>
        </div>
        {valorRestante > 0 && (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">
              Valor de cada parcela ({formData.numeroParcelas}x):
            </span>
            <span className="text-gray-900">{formataMoeda(valorParcela)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contrato Assinado</label>
          <div className="mt-1 flex items-center">
            <label className="block w-full">
              <span className="sr-only">Escolher arquivo</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setContratoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-dark"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Comprovante de Pagamento</label>
          <div className="mt-1 flex items-center">
            <label className="block w-full">
              <span className="sr-only">Escolher arquivo</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-dark"
              />
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observações</label>
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
          {loading ? 'Salvando...' : processo ? 'Atualizar Processo' : 'Criar Processo'}
        </button>
      </div>
    </form>
  );
}