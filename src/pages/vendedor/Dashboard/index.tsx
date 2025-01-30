import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { clientesService } from '../../../services/clientes';
import { processosService } from '../../../services/processos';
import TabelaProcessos from '../../../components/Dashboard/TabelaProcessos';
import ListaClientes from './ListaClientes';
import { formataMoeda } from '../../../utils/formatadores';
import EmpresaRequired from '../../../components/EmpresaRequired';


export default function VendedorDashboard() {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalClientes: 0,
    processosAtivos: 0,
    valoresRecebidos: 0,
    valoresPendentes: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !empresaSelecionada) return;

      try {
        setLoading(true);
        setError(null);

        // Carregar clientes e processos em paralelo
        const [clientes, processos] = await Promise.all([
          clientesService.listarPorVendedor(user.uid),
          processosService.listarPorVendedor(user.uid)
        ]);

        setClientes(clientes);
        setProcessos(processos);
        
        // Calcular estatísticas
        const processosAtivos = processos.filter(p => 
          p.status !== 'cancelado' && p.status !== 'rejeitado'
        ).length;

        // Calcular valores recebidos e pendentes
        const valoresRecebidos = processos
          .filter(p => p.status !== 'cancelado' && p.status !== 'rejeitado')
          .reduce((total, processo) => total + (Number(processo.valorEntrada) || 0), 0);

        const valoresPendentes = processos
          .filter(p => p.status !== 'cancelado' && p.status !== 'rejeitado')
          .reduce((total, processo) => {
            const valorTotal = Number(processo.valor) || 0;
            const valorEntrada = Number(processo.valorEntrada) || 0;
            return total + (valorTotal - valorEntrada);
          }, 0);

        setStats({
          totalClientes: clientes.length,
          processosAtivos,
          valoresRecebidos,
          valoresPendentes
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user, empresaSelecionada]);

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total de Clientes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalClientes}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <a 
                href="/dashboard/meus-clientes"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ver todos os clientes →
              </a>
            </div>
          </div>

          {/* Total de Processos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processos Ativos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.processosAtivos}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <a 
                href="/dashboard/processos"
                className="text-sm text-green-600 hover:text-green-800"
              >
                Ver todos os processos →
              </a>
            </div>
          </div>

          {/* Faturamento Total */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valores Recebidos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formataMoeda(stats.valoresRecebidos)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Total de entradas recebidas
            </p>
          </div>
          
          {/* Valores Pendentes */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valores Pendentes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formataMoeda(stats.valoresPendentes)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Total de valores a receber
            </p>
          </div>
        </div>

        {/* Lista de Clientes Ativos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Clientes Ativos</h2>
              <a 
                href="/dashboard/meus-clientes"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Ver todos →
              </a>
            </div>
          </div>
          <ListaClientes 
            clientes={clientes.filter(c => c.status === 'ativo')} 
            processos={processos}
          />
        </div>

        {/* Lista de Processos Ativos */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Processos em Andamento</h2>
                <a 
                  href="/dashboard/processos"
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Ver todos →
                </a>
              </div>
            </div>
            <TabelaProcessos 
              processos={processos.filter(p => 
                p.status !== 'cancelado' && p.status !== 'rejeitado'
              ).sort((a, b) => {
                // Sort by priority (status) and deadline
                const statusPriority = {
                  'pendente': 3,
                  'em_analise': 2,
                  'aprovado': 1
                };
                return (
                  statusPriority[b.status] - statusPriority[a.status] ||
                  a.dataCriacao.getTime() - b.dataCriacao.getTime()
                );
              })} 
            />
          </div>
        </div>
      </div>
    </EmpresaRequired>
  );
}