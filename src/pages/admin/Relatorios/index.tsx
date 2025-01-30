import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { receitasService, despesasService, centroCustosService } from '../../../services/financeiro';
import { gerarRelatorioCentroCusto, gerarRelatorioProcessos, downloadTxtFile } from '../../../utils/relatorios';
import { processosService } from '../../../services/processos';
import { formataMoeda } from '../../../utils/formatadores';
import GraficoDesempenhoMensal from '../../../components/Graficos/GraficoDesempenhoMensal';
import GraficoFaturamentoConsultor from '../../../components/Graficos/GraficoFaturamentoConsultor';
import GraficoFluxoCaixa from '../../../components/Graficos/GraficoFluxoCaixa';
import EmpresaRequired from '../../../components/EmpresaRequired';
import { FileText, TrendingUp, DollarSign } from 'lucide-react';

export default function Relatorios() {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dadosMensais, setDadosMensais] = useState<any[]>([]);
  const [dadosConsultores, setDadosConsultores] = useState<any[]>([]);
  const [dadosFluxoCaixa, setDadosFluxoCaixa] = useState<any[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
  const [processos, setProcessos] = useState<any[]>([]);
  const [periodoRelatorio, setPeriodoRelatorio] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    fim: new Date() // Hoje
  });
  const [resumo, setResumo] = useState({
    totalProcessos: 0,
    totalEntradas: 0,
    valorPendente: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !empresaSelecionada) return;

      try {
        setLoading(true);
        setError(null);

        // Get all users from the company first
        const usersQuery = query(
          collection(db, 'users'),
          where('empresaId', '==', empresaSelecionada.id)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const userIds = usersSnapshot.docs.map(doc => doc.id);

        // Get all centers of cost for all users
        let centros = [];
        if (user.tipo === 'vendedor') {
          // If user is a vendor, get only their cost centers
          centros = await centroCustosService.listarPorUsuario(user.uid);
        } else {
          // For other users, get all cost centers from all users
          const centrosPromises = userIds.map(userId => 
            centroCustosService.listarPorUsuario(userId)
          );
          const centrosArrays = await Promise.all(centrosPromises);
          centros = centrosArrays.flat();
        }

        // Get all receipts for all users
        let receitas = [];
        if (user.tipo === 'vendedor') {
          // If user is a vendor, get only their receipts
          receitas = await receitasService.listarPorUsuario(user.uid);
        } else {
          // For other users, get all receipts from all users
          const receitasPromises = userIds.map(userId =>
            receitasService.listarPorUsuario(userId)
          );
          const receitasArrays = await Promise.all(receitasPromises);
          receitas = receitasArrays.flat();
        }

        // Get expenses and processes
        const [despesas, processos] = await Promise.all([
          despesasService.listarPorEmpresa(empresaSelecionada.id),
          user.tipo === 'vendedor' 
            ? processosService.listarPorVendedor(user.uid)
            : processosService.listarPorEmpresa(empresaSelecionada.id)
        ]);

        setProcessos(processos);

        // Preparar dados dos centros de custo com suas receitas e despesas
        const centrosComTransacoes = centros.map(centro => {
          const receitasCentro = receitas.filter(r => r.centroCustoId === centro.id);
          const despesasCentro = despesas.filter(d => d.centroCustoId === centro.id);
          
          const totalReceitas = receitasCentro.reduce((acc, r) => acc + r.valor, 0);
          const totalDespesas = despesasCentro.reduce((acc, d) => acc + d.valor, 0);
          
          return {
            ...centro,
            receitas: receitasCentro,
            despesas: despesasCentro,
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas
          };
        });

        setCentrosCusto(centrosComTransacoes);

        // Preparar dados para gráfico de desempenho mensal
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dadosPorMes = meses.map((mes, index) => {
          const receitasMes = receitas.filter(r => r.data.getMonth() === index);
          const totalReceitas = receitasMes.reduce((acc, r) => acc + r.valor, 0);
          return {
            mes,
            faturamento: totalReceitas,
            meta: totalReceitas * 1.1 // Meta 10% acima do realizado
          };
        });
        setDadosMensais(dadosPorMes);

        // Preparar dados para gráfico de consultores
        const consultoresDados = processos.reduce((acc, processo) => {
          if (!acc[processo.vendedorId]) {
            const vendedor = usersSnapshot.docs.find(doc => doc.id === processo.vendedorId);
            acc[processo.vendedorId] = {
              nome: vendedor ? vendedor.data().nome : 'Não identificado',
              faturamento: 0
            };
          }
          acc[processo.vendedorId].faturamento += processo.valor;
          return acc;
        }, {});
        setDadosConsultores(Object.values(consultoresDados));

        // Preparar dados para gráfico de fluxo de caixa
        const hoje = new Date();
        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
          const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - i);
          return data;
        }).reverse();

        const fluxoCaixaDados = ultimos7Dias.map(data => {
          const receitasDia = receitas.filter(r => {
            const receitaData = new Date(r.data);
            return receitaData.getFullYear() === data.getFullYear() &&
                   receitaData.getMonth() === data.getMonth() &&
                   receitaData.getDate() === data.getDate();
          });
          const despesasDia = despesas.filter(d => {
            const despesaData = new Date(d.data);
            return despesaData.getFullYear() === data.getFullYear() &&
                   despesaData.getMonth() === data.getMonth() &&
                   despesaData.getDate() === data.getDate();
          });
          return {
            data: data.toLocaleDateString(),
            entradas: receitasDia.reduce((acc, r) => acc + r.valor, 0),
            saidas: despesasDia.reduce((acc, d) => acc + d.valor, 0)
          };
        });
        setDadosFluxoCaixa(fluxoCaixaDados);

        // Calcular resumo
        const totalProcessos = processos.length;
        const totalEntradas = processos.reduce((acc, p) => acc + p.valorEntrada, 0);
        const valorPendente = processos.reduce((acc, p) => {
          const valorRestante = p.valor - p.valorEntrada;
          return acc + valorRestante;
        }, 0);

        setResumo({
          totalProcessos,
          totalEntradas,
          valorPendente
        });

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados dos relatórios. Por favor, tente novamente.');
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
        <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Processos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {resumo.totalProcessos}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Entradas</p>
                <p className="text-2xl font-semibold text-green-600">
                  {formataMoeda(resumo.totalEntradas)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valor Pendente</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {formataMoeda(resumo.valorPendente)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        {user?.tipo !== 'vendedor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoDesempenhoMensal dados={dadosMensais} />
            <GraficoFaturamentoConsultor dados={dadosConsultores} />
          </div>
        )}
        
        <div className="w-full">
          <GraficoFluxoCaixa dados={dadosFluxoCaixa} />
        </div>
        
        {/* Relatório de Processos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Relatório de Processos</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">De:</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={periodoRelatorio.inicio.toISOString().split('T')[0]}
                    onChange={(e) => setPeriodoRelatorio(prev => ({
                      ...prev,
                      inicio: new Date(e.target.value)
                    }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Até:</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={periodoRelatorio.fim.toISOString().split('T')[0]}
                    onChange={(e) => setPeriodoRelatorio(prev => ({
                      ...prev,
                      fim: new Date(e.target.value)
                    }))}
                  />
                </div>
                <button
                  onClick={() => {
                    const conteudo = gerarRelatorioProcessos(processos, periodoRelatorio);
                    downloadTxtFile(conteudo, `relatorio-processos-${periodoRelatorio.inicio.toISOString().split('T')[0]}-a-${periodoRelatorio.fim.toISOString().split('T')[0]}.txt`);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                >
                  Exportar Relatório
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processos
                    .filter(p => p.dataCriacao >= periodoRelatorio.inicio && p.dataCriacao <= periodoRelatorio.fim)
                    .filter(p => user.tipo === 'vendedor' ? p.vendedorId === user.uid : true)
                    .sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime())
                    .map((processo) => (
                      <tr key={processo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {processo.dataCriacao.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {processo.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {processo.clienteNome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {processo.clienteDocumento || 'Não informado'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formataMoeda(processo.valor)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Análise de Centros de Custo */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Análise por Centro de Custo</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">De:</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={periodoRelatorio.inicio.toISOString().split('T')[0]}
                    onChange={(e) => setPeriodoRelatorio(prev => ({
                      ...prev,
                      inicio: new Date(e.target.value)
                    }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Até:</label>
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={periodoRelatorio.fim.toISOString().split('T')[0]}
                    onChange={(e) => setPeriodoRelatorio(prev => ({
                      ...prev,
                      fim: new Date(e.target.value)
                    }))}
                  />
                </div>
                <button
                  onClick={() => {
                    const conteudo = gerarRelatorioCentroCusto(centrosCusto, periodoRelatorio);
                    downloadTxtFile(conteudo, `relatorio-centros-custo-${periodoRelatorio.inicio.toISOString().split('T')[0]}-a-${periodoRelatorio.fim.toISOString().split('T')[0]}.txt`);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                >
                  Exportar Relatório
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {centrosCusto.map((centro) => (
                <div key={centro.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{centro.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {centro.tipo === 'receita' ? 'Centro de Receitas' : 'Centro de Despesas'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Orçamento:</p>
                      <p className="font-medium text-gray-900">{formataMoeda(centro.orcamento)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Total Receitas</p>
                      <p className="text-lg font-semibold text-green-700">
                        {formataMoeda(centro.totalReceitas)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Total Despesas</p>
                      <p className="text-lg font-semibold text-red-700">
                        {formataMoeda(centro.totalDespesas)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      centro.saldo >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
                    }`}>
                      <p className={`text-sm ${
                        centro.saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'
                      }`}>Saldo</p>
                      <p className={`text-lg font-semibold ${
                        centro.saldo >= 0 ? 'text-blue-700' : 'text-yellow-700'
                      }`}>
                        {formataMoeda(centro.saldo)}
                      </p>
                    </div>
                  </div>

                  {/* Lista de Transações */}
                  <div className="mt-4 space-y-2">
                    <p className="font-medium text-gray-900">Últimas Transações</p>
                    <div className="max-h-48 overflow-y-auto">
                      {[...centro.receitas, ...centro.despesas]
                        .sort((a, b) => b.data.getTime() - a.data.getTime())
                        .slice(0, 5)
                        .map((transacao) => (
                          <div 
                            key={transacao.id}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transacao.descricao}
                              </p>
                              <p className="text-xs text-gray-500">
                                {transacao.data.toLocaleDateString()}
                              </p>
                            </div>
                            <p className={`text-sm font-medium ${
                              'receitas' in centro ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formataMoeda(transacao.valor)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EmpresaRequired>
  );
}