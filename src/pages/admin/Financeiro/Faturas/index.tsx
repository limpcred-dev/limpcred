import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useEmpresa } from '../../../../contexts/EmpresaContext';
import { faturasService } from '../../../../services/financeiro';
import { processosService } from '../../../../services/processos';
import { formataMoeda } from '../../../../utils/formatadores';
import { Fatura } from '../../../../types/financeiro';
import { Processo } from '../../../../types/processo';
import EmpresaRequired from '../../../../components/EmpresaRequired';
import FormFatura from './FormFatura';

export default function Faturas() {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [faturaSelecionada, setFaturaSelecionada] = useState<Fatura | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    status: '',
    processoId: '',
    dataInicio: '',
    dataFim: ''
  });

  const carregarDados = async () => {
    if (!user || !empresaSelecionada) return;
    
    try {
      setLoading(true);
      setError(null);

      const processosData = await processosService.listarPorEmpresa(empresaSelecionada.id);
      
      // Filtrar apenas processos do vendedor atual
      const processosVendedor = processosData.filter(p => p.vendedorId === user.uid);
      setProcessos(processosVendedor);

      let todasFaturas: Fatura[] = [];
      for (const processo of processosVendedor) {
        const faturasProcesso = await faturasService.listarPorProcesso(processo.id);
        todasFaturas = [...todasFaturas, ...faturasProcesso];
      }

      setFaturas(todasFaturas);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [user, empresaSelecionada]);

  const faturasFiltradas = faturas.filter(fatura => {
    const matchesSearch = 
      fatura.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm === '';

    const matchesStatus = !filtros.status || fatura.status === filtros.status;
    const matchesProcesso = !filtros.processoId || fatura.processoId === filtros.processoId;
    
    const matchesDate = (!filtros.dataInicio || new Date(fatura.dataVencimento) >= new Date(filtros.dataInicio)) &&
                       (!filtros.dataFim || new Date(fatura.dataVencimento) <= new Date(filtros.dataFim));

    return matchesSearch && matchesStatus && matchesProcesso && matchesDate;
  }).sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());

  // Calcular indicadores
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

  const indicadores = {
    valorAtrasado: faturas
      .filter(f => f.status === 'atrasado')
      .reduce((acc, f) => acc + f.valor, 0),
    valorTotal: faturas
      .filter(f => f.status !== 'cancelado')
      .reduce((acc, f) => acc + f.valor, 0),
    valorRecebido30Dias: faturas
      .filter(f => 
        f.status === 'pago' && 
        f.dataPagamento && 
        f.dataPagamento >= trintaDiasAtras
      )
      .reduce((acc, f) => acc + f.valor, 0)
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' };
      case 'pago':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' };
      case 'atrasado':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Faturas</h1>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Faturas Atrasadas</p>
                <p className="text-2xl font-semibold text-red-600">
                  {formataMoeda(indicadores.valorAtrasado)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total a Receber</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {formataMoeda(indicadores.valorTotal)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recebido (30 dias)</p>
                <p className="text-2xl font-semibold text-green-600">
                  {formataMoeda(indicadores.valorRecebido30Dias)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
              <FormFatura
                fatura={faturaSelecionada!}
                onClose={() => {
                  setShowForm(false);
                  setFaturaSelecionada(null);
                }}
                onSuccess={() => {
                  setShowForm(false);
                  setFaturaSelecionada(null);
                  carregarDados();
                }}
              />
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filtros.processoId}
                onChange={(e) => setFiltros(prev => ({ ...prev, processoId: e.target.value }))}
              >
                <option value="">Todos os Processos</option>
                {processos.map(processo => (
                  <option key={processo.id} value={processo.id}>
                    {processo.nome}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                placeholder="Data Inicial"
              />

              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                placeholder="Data Final"
              />
            </div>
          </div>
        </div>

        {/* Lista de Faturas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faturasFiltradas.map((fatura) => {
            const processo = processos.find(p => p.id === fatura.processoId);
            const status = getStatusConfig(fatura.status);
            const StatusIcon = status.icon;
            const isAtrasada = fatura.status === 'atrasado';

            return (
              <div
                key={fatura.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  isAtrasada ? 'border-2 border-red-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{fatura.clienteNome}</h3>
                      <p className="text-sm text-gray-500">{processo?.nome}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {fatura.status.charAt(0).toUpperCase() + fatura.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Parcela</span>
                      <span className="text-sm font-medium">{fatura.numeroParcela}/{fatura.totalParcelas}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Valor</span>
                      <span className="text-sm font-medium">{formataMoeda(fatura.valor)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Vencimento</span>
                      <span className="text-sm font-medium">{fatura.dataVencimento.toLocaleDateString()}</span>
                    </div>

                    {fatura.dataPagamento && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Pago em</span>
                        <span className="text-sm font-medium">{fatura.dataPagamento.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setFaturaSelecionada(fatura);
                        setShowForm(true);
                      }}
                      className="w-full text-center text-primary hover:text-primary-dark font-medium"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {faturasFiltradas.length === 0 && (
            <div className="col-span-full text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma fatura encontrada</h3>
              <p className="text-gray-500">
                Não existem faturas que correspondam aos filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>
    </EmpresaRequired>
  );
}