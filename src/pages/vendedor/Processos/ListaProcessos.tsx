import React, { useState } from 'react';
import { FileText, Eye, Edit2, Clock, CheckCircle, AlertCircle, XCircle, Calendar, DollarSign, User, Shield, ChevronDown } from 'lucide-react';
import { Processo } from '../../../types/processo';
import { formataMoeda } from '../../../utils/formatadores';
import ProcessoDetalhes from './ProcessoDetalhes';
import { processosService } from '../../../services/processos';

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

interface ListaProcessosProps {
  processos: Processo[];
  onEdit: (processo: Processo) => void;
  onStatusChange?: () => void;
}

export default function ListaProcessos({ processos, onEdit, onStatusChange }: ListaProcessosProps) {
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProcessos, setSelectedProcessos] = useState<string[]>([]);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [showBulkStatusMenu, setShowBulkStatusMenu] = useState(false);

  const statusOrder = [
    'Pendentes de envio',
    'Pendentes de entrega',
    'Enviado',
    'Entregue',
    'Garantia',
    'Aguardando conclusão'
  ];

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || {
      icon: AlertCircle,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-500',
      text: status
    };
  };

  const handleStatusChange = async (processo: Processo, newStatus: string) => {
    if (loading) return;

    try {
      setLoading(true);
      await processosService.atualizar(processo.id, {
        status: newStatus
      });
      setShowStatusMenu(null);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (loading || selectedProcessos.length === 0) return;

    try {
      setLoading(true);
      await Promise.all(
        selectedProcessos.map(id => 
          processosService.atualizar(id, { status: newStatus })
        )
      );
      setShowBulkStatusMenu(false);
      setSelectedProcessos([]);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Erro ao atualizar status em lote:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProcessoSelection = (processoId: string) => {
    setSelectedProcessos(prev => 
      prev.includes(processoId) 
        ? prev.filter(id => id !== processoId)
        : [...prev, processoId]
    );
  };

  const toggleAllProcessos = () => {
    setSelectedProcessos(prev => 
      prev.length === processos.length ? [] : processos.map(p => p.id)
    );
  };

  return (
    <div>
      {/* Bulk Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProcessos.length === processos.length}
              onChange={toggleAllProcessos}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">
              {selectedProcessos.length === 0 
                ? 'Selecionar todos' 
                : `${selectedProcessos.length} processo(s) selecionado(s)`}
            </span>
          </label>
        </div>
        
        {selectedProcessos.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBulkStatusMenu(!showBulkStatusMenu)}
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark disabled:opacity-50"
            >
              Alterar Status
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showBulkStatusMenu && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {statusOrder.map((statusOption) => {
                    const optionConfig = getStatusConfig(statusOption);
                    return (
                      <div
                        key={statusOption}
                        onClick={() => handleBulkStatusChange(statusOption)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center cursor-pointer"
                      >
                        <optionConfig.icon className={`w-4 h-4 mr-2 ${optionConfig.iconColor}`} />
                        <span>{optionConfig.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processos.map((processo) => {
          const status = getStatusConfig(processo.status);
          const StatusIcon = status.icon;
          
          return (
            <div
              key={processo.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedProcessos.includes(processo.id)}
                    onChange={() => toggleProcessoSelection(processo.id)}
                    className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{processo.nome}</h3>
                    <div
                      onClick={() => setShowStatusMenu(showStatusMenu === processo.id ? null : processo.id)}
                      className={`relative inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} hover:opacity-80 transition-opacity cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <StatusIcon className={`w-3.5 h-3.5 mr-1 ${status.iconColor}`} />
                        {status.text}
                        <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        
                        {showStatusMenu === processo.id && (
                          <div className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50" onClick={e => e.stopPropagation()}>
                            <div className="py-1">
                              {statusOrder.map((statusOption) => {
                                const optionConfig = getStatusConfig(statusOption);
                                return (
                                  <div
                                    key={statusOption}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!loading) {
                                        handleStatusChange(processo, statusOption);
                                      }
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center cursor-pointer ${
                                      processo.status === statusOption ? 'bg-gray-50' : ''
                                    }`}
                                  >
                                    <optionConfig.icon className={`w-4 h-4 mr-2 ${optionConfig.iconColor}`} />
                                    <span>{optionConfig.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProcessoSelecionado(processo)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-500 hover:text-primary" />
                    </button>
                    <button
                      onClick={() => onEdit(processo)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit2 className="w-5 h-5 text-gray-500 hover:text-primary" />
                    </button>
                  </div>
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

      {processos.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum processo encontrado</h3>
          <p className="text-gray-500">
            Comece criando um novo processo para visualizá-lo aqui.
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
  );
}