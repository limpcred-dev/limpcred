import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, UserCheck } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { maskCPFCNPJ } from '../../../utils/masks';
import { processosService } from '../../../services/processos';
import { clientesService } from '../../../services/clientes';
import { receitasService, despesasService } from '../../../services/financeiro';
import { empresasService } from '../../../services/empresas';
import GraficoFaturamento from '../../../components/Dashboard/GraficoFaturamento';
import TabelaProcessos from '../../../components/Dashboard/TabelaProcessos';
import EmpresaRequired from '../../../components/EmpresaRequired';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState([]);
  const [vendedores, setVendedores] = useState({});
  const [clientes, setClientes] = useState([]);
  const [indicadores, setIndicadores] = useState({
    totalClientes: 0,
    totalProcessos: 0,
    totalVendedores: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !empresaSelecionada) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Carregar vendedores e calcular total
        const vendedoresDoc = await getDocs(query(
          collection(db, 'users'),
          where('empresaId', '==', empresaSelecionada.id),
          where('tipo', '==', 'vendedor')
        ));
        const vendedoresMap = {};
        vendedoresDoc.docs.forEach(doc => {
          const data = doc.data();
          vendedoresMap[doc.id] = data.nome;
        });
        setVendedores(vendedoresMap);
        
        // Carregar clientes do vendedor atual
        const clientesData = await clientesService.listarPorVendedorEEmpresa(user.uid, empresaSelecionada.id);
        setClientes(clientesData);
        
        // Carregar total de processos
        const processosDoc = await getDocs(query(
          collection(db, 'processos'),
          where('empresaId', '==', empresaSelecionada.id)
        ));
        
        // Atualizar indicadores
        setIndicadores({
          totalClientes: clientesData.length,
          totalProcessos: processosDoc.size,
          totalVendedores: vendedoresDoc.size
        });

        // Carregar dados em paralelo
        let processos = [], receitas = [], despesas = [];
        
        try {
          [processos, receitas, despesas] = await Promise.all([
            processosService.listarPorEmpresa(empresaSelecionada.id),
            receitasService.listarPorUsuario(user.uid),
            despesasService.listarPorEmpresa(empresaSelecionada.id)
          ]);
          
          // Adicionar nome do vendedor aos processos
          const processosComVendedor = processos.map(processo => ({
            ...processo,
            vendedorNome: vendedoresMap[processo.vendedorId] || 'Vendedor não encontrado'
          }));
          
          setProcessos(processosComVendedor);
        } catch (err) {
          console.error('Erro ao carregar dados:', err);
          // Garantir que todas as variáveis sejam arrays mesmo em caso de erro
          processos = processos || [];
          receitas = receitas || [];
          despesas = despesas || [];
        }

        // Calcular métricas
        const processosAtivos = processos.filter(p => 
          p.status !== 'cancelado' && p.status !== 'rejeitado'
        ).length;

        // Calcular faturamento mensal
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const receitasMes = receitas.filter(r => r.data && r.data >= primeiroDiaMes);
        const despesasMes = despesas.filter(d => d.data && d.data >= primeiroDiaMes);
        const faturamentoMensal = receitasMes.reduce((acc, r) => acc + r.valor, 0);

        // Calcular crescimento (comparando com mês anterior)
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const receitasMesAnterior = receitas.filter(r => 
          r.data && r.data >= mesAnterior && r.data < primeiroDiaMes
        );
        const faturamentoMesAnterior = receitasMesAnterior.reduce((acc, r) => acc + r.valor, 0);
        const crescimentoFaturamento = faturamentoMesAnterior > 0 
          ? ((faturamentoMensal - faturamentoMesAnterior) / faturamentoMesAnterior) * 100 
          : 100;

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar alguns dados do dashboard. Tente novamente em alguns instantes.');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total de Clientes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {indicadores.totalClientes}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/dashboard/meus-clientes"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                Ver todos os clientes →
              </Link>
            </div>
          </div>

          {/* Total de Processos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Processos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {indicadores.totalProcessos}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/dashboard/todos-processos" 
                className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
              >
                Ver todos os processos →
              </Link>
            </div>
          </div>

          {/* Total de Vendedores - Agora na mesma linha */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Vendedores</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {indicadores.totalVendedores}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/dashboard/cadastros/usuarios" 
                className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
              >
                Ver todos os vendedores →
              </Link>
            </div>
          </div>

        </div>

        <div className="w-full">
          <GraficoFaturamento />
        </div>

        {/* Listas de Clientes e Processos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Lista de Clientes */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Clientes Recentes</h2>
              <Link to="/dashboard/meus-clientes" className="text-primary hover:text-primary-dark text-sm">
                Ver todos →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes?.slice(0, 5).map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                        <div className="text-xs text-gray-500">{cliente.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {maskCPFCNPJ(cliente.documento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cliente.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lista de Processos */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Últimos Processos</h2>
              <Link to="/dashboard/todos-processos" className="text-primary hover:text-primary-dark text-sm">
                Ver todos →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processos?.slice(0, 5).map((processo) => (
                    <tr key={processo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{processo.nome}</div>
                        <div className="text-xs text-gray-500">
                          {processo.dataCriacao.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {processo.clienteNome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          processo.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                          processo.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                          processo.status === 'em_analise' ? 'bg-blue-100 text-blue-800' :
                          processo.status === 'cancelado' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {processo.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </EmpresaRequired>
  );
}