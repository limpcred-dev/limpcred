import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { processosService } from '../../../services/processos';
import { clientesService } from '../../../services/clientes';
import { Processo } from '../../../types/processo';
import { Cliente } from '../../../types/cliente';
import FormProcesso from './FormProcesso';
import ListaProcessos from './ListaProcessos';
import EmpresaRequired from '../../../components/EmpresaRequired';

export default function Processos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [processoParaEditar, setProcessoParaEditar] = useState<Processo | null>(null);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    metodoPagamento: '',
    dataInicio: '',
    dataFim: '',
    valorMinimo: '',
    valorMaximo: '',
    clienteId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const carregarDados = async () => {
    if (!user) return;
    
    try {
      setError(null);
      setLoading(true);
      
      const [processosData, clientesData] = await Promise.all([
        processosService.listarPorVendedor(user.uid),
        clientesService.listarPorVendedor(user.uid)
      ]);
      
      setProcessos(processosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [user]);
  
  // Open form if clienteId is provided in navigation state
  useEffect(() => {
    if (location.state?.clienteId && clientes.length > 0) {
      setShowForm(true);
      // Clear the state to prevent reopening the form on navigation
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, clientes]);

  const processosFiltrados = processos.filter(processo => {
    // Search filter
    const matchesSearch = 
      processo?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo?.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm === '';
    
    // Status filter
    const matchesStatus = !filters.status || processo.status === filters.status;
    
    // Payment method filter
    const matchesPayment = !filters.metodoPagamento || processo.metodoPagamento === filters.metodoPagamento;
    
    // Date range filter
    const matchesDateRange = (!filters.dataInicio || new Date(processo.dataCriacao) >= new Date(filters.dataInicio)) &&
                            (!filters.dataFim || new Date(processo.dataCriacao) <= new Date(filters.dataFim));
    
    // Value range filter
    const matchesValueRange = (!filters.valorMinimo || processo.valor >= Number(filters.valorMinimo)) &&
                             (!filters.valorMaximo || processo.valor <= Number(filters.valorMaximo));
    
    // Client filter
    const matchesClient = !filters.clienteId || processo.clienteId === filters.clienteId;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDateRange && 
           matchesValueRange && matchesClient;
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
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              Novo Processo
            </button>
          )}
        </div>

        {showForm && (
          <FormProcesso
            processo={processoParaEditar}
            clientes={clientes}
            onClose={() => {
              setShowForm(false);
              setProcessoParaEditar(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setProcessoParaEditar(null);
              carregarDados();
            }}
          />
        )}

        {!showForm && processos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum processo cadastrado
            </h2>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro processo para acompanhar o andamento.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              Iniciar Novo Processo
            </button>
          </div>
        ) : !showForm && (
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar processos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Filtros</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                  </button>
                </div>
                
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="">Todos</option>
                        <option value="Pendentes de envio">Pendentes de envio</option>
                        <option value="Pendentes de entrega">Pendentes de entrega</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue</option>
                        <option value="Garantia">Garantia</option>
                        <option value="Aguardando conclusão">Aguardando conclusão</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pagamento
                      </label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        value={filters.metodoPagamento}
                        onChange={(e) => setFilters(prev => ({ ...prev, metodoPagamento: e.target.value }))}
                      >
                        <option value="">Todos</option>
                        <option value="pix">PIX</option>
                        <option value="cartao">Cartão de Crédito</option>
                        <option value="boleto">Boleto</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente
                      </label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        value={filters.clienteId}
                        onChange={(e) => setFilters(prev => ({ ...prev, clienteId: e.target.value }))}
                      >
                        <option value="">Todos</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        value={filters.dataInicio}
                        onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Final
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        value={filters.dataFim}
                        onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Mín"
                          className="w-1/2 rounded-md border border-gray-300 px-3 py-2"
                          value={filters.valorMinimo}
                          onChange={(e) => setFilters(prev => ({ ...prev, valorMinimo: e.target.value }))}
                        />
                        <input
                          type="number"
                          placeholder="Máx"
                          className="w-1/2 rounded-md border border-gray-300 px-3 py-2"
                          value={filters.valorMaximo}
                          onChange={(e) => setFilters(prev => ({ ...prev, valorMaximo: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {showFilters && (
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setFilters({
                        status: '',
                        metodoPagamento: '',
                        dataInicio: '',
                        dataFim: '',
                        valorMinimo: '',
                        valorMaximo: '',
                        clienteId: ''
                      })}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>

            <ListaProcessos 
              processos={processosFiltrados}
              onEdit={(processo) => {
                setProcessoParaEditar(processo);
                setShowForm(true);
              }}
              onStatusChange={carregarDados}
            />
          </div>
        )}
      </div>
    </EmpresaRequired>
  );
}