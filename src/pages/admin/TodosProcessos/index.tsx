import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Check, Loader2, Eye, Clock, CheckCircle, AlertCircle, XCircle, Calendar, DollarSign, User, Shield } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { processosService } from '../../../services/processos';
import { formataMoeda } from '../../../utils/formatadores';
import EmpresaRequired from '../../../components/EmpresaRequired';
import ProcessoDetalhes from '../../../components/ProcessoDetalhes';

const statusConfig = {
  'Pendentes de envio': {
    icon: AlertCircle,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    text: 'Pendente de Envio'
  },
  'Pendentes de entrega': {
    icon: Clock,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    text: 'Pendente de Entrega'
  },
  'Enviado': {
    icon: Clock,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    text: 'Enviado'
  },
  'Entregue': {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    text: 'Entregue'
  },
  'Garantia': {
    icon: Shield,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-500',
    text: 'Em Garantia'
  },
  'Aguardando conclusão': {
    icon: Clock,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    iconColor: 'text-gray-500',
    text: 'Aguardando Conclusão'
  }
} as const;

export default function TodosProcessos() {
  const [showForm, setShowForm] = useState(false);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [error, setError] = useState<string | null>(null);
  const [selectedProcessos, setSelectedProcessos] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || {
      icon: AlertCircle,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-500',
      text: status
    };
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedProcessos.length === 0) return;

    try {
      setUpdatingStatus(true);
      setError(null);

      await Promise.all(
        selectedProcessos.map(id => 
          processosService.atualizar(id, { status: newStatus })
        )
      );

      const lista = await processosService.listarPorEmpresa(empresaSelecionada.id);
      setProcessos(lista);
      setSelectedProcessos([]);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status dos processos. Tente novamente.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const carregarProcessos = async () => {
      if (!empresaSelecionada) return;
      
      try {
        setLoading(true);
        setError(null);
        const lista = await processosService.listarPorEmpresa(empresaSelecionada.id);
        setProcessos(lista);
      } catch (err) {
        console.error('Erro ao carregar processos:', err);
        setError('Não foi possível carregar os processos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    carregarProcessos();
  }, [empresaSelecionada]);

  const processosFiltrados = processos.filter(processo => {
    const matchesSearch = 
      processo?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo?.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm === '';
    
    const matchesStatus = statusFilter === 'todos' || processo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <EmpresaRequired>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Todos os Processos</h1>
          {selectedProcessos.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedProcessos.length} processo(s) selecionado(s)
              </span>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                value=""
                disabled={updatingStatus}
              >
                <option value="">Alterar status</option>
                <option value="Pendentes de envio">Pendentes de envio</option>
                <option value="Pendentes de entrega">Pendentes de entrega</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregue">Entregue</option>
                <option value="Garantia">Garantia</option>
                <option value="Aguardando conclusão">Aguardando conclusão</option>
              </select>
              {updatingStatus && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, cliente ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="Pendentes de envio">Pendentes de envio</option>
            <option value="Pendentes de entrega">Pendentes de entrega</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregue">Entregue</option>
            <option value="Garantia">Garantia</option>
            <option value="Aguardando conclusão">Aguardando conclusão</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processosFiltrados.map((processo) => {
            const status = getStatusConfig(processo.status);
            const StatusIcon = status.icon;
            
            return (
              <div
                key={processo.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{processo.nome}</h3>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                        <StatusIcon className={`w-3.5 h-3.5 mr-1 ${status.iconColor}`} />
                        {status.text}
                      </div>
                    </div>
                    <button
                      onClick={() => setProcessoSelecionado(processo)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-500 hover:text-primary" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{processo.clienteNome}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{processo.dataCriacao.toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-green-600">{formataMoeda(processo.valor)}</span>
                  </div>

                  {processo.metodoPagamento && (
                    <div className="text-xs text-gray-500">
                      Pagamento: <span className="font-medium capitalize">{processo.metodoPagamento}</span>
                      {processo.numeroParcelas > 1 && ` em ${processo.numeroParcelas}x`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {processosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum processo encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar os filtros para encontrar o que procura.
            </p>
          </div>
        )}

        {processoSelecionado && (
          <ProcessoDetalhes
            processo={processoSelecionado}
            onClose={() => setProcessoSelecionado(null)}
          />
        )}
      </div>
    </EmpresaRequired>
  );
}