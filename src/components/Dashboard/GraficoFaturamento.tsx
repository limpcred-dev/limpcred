import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { receitasService } from '../../services/financeiro';
import { formataMoeda } from '../../utils/formatadores';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const GraficoFaturamento = () => {
  const [periodoAtual, setPeriodoAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();

  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !empresaSelecionada) return;

      try {
        setLoading(true);
        setError(null);

        // Get all users from the company
        const usersQuery = query(
          collection(db, 'users'),
          where('empresaId', '==', empresaSelecionada.id)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const userIds = usersSnapshot.docs.map(doc => doc.id);

        // Get all receipts for all users
        let todasReceitas = [];
        if (user.tipo === 'vendedor') {
          // If user is a vendor, get only their receipts
          todasReceitas = await receitasService.listarPorUsuario(user.uid);
        } else {
          // For other users, get all receipts from all users
          const receitasPromises = userIds.map(userId =>
            receitasService.listarPorUsuario(userId)
          );
          const receitasArrays = await Promise.all(receitasPromises);
          todasReceitas = receitasArrays.flat();
        }

        // Prepare data for last 6 months
        const hoje = new Date();
        const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
          const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
          return {
            mes: data.toLocaleString('default', { month: 'short' }),
            data: data
          };
        }).reverse();

        const dados6Meses = ultimos6Meses.map(({ mes, data }) => {
          const receitasMes = todasReceitas.filter(r => 
            r.data.getMonth() === data.getMonth() &&
            r.data.getFullYear() === data.getFullYear()
          );
          const valor = receitasMes.reduce((acc, r) => acc + r.valor, 0);
          return {
            mes,
            valor,
            meta: valor * 1.1 // Meta 10% acima do realizado
          };
        });

        // Prepare data for last 12 months
        const ultimos12Meses = Array.from({ length: 12 }, (_, i) => {
          const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
          return {
            mes: `${data.toLocaleString('default', { month: 'short' })}/${data.getFullYear().toString().slice(2)}`,
            data: data
          };
        }).reverse();

        const dados12Meses = ultimos12Meses.map(({ mes, data }) => {
          const receitasMes = todasReceitas.filter(r => 
            r.data.getMonth() === data.getMonth() &&
            r.data.getFullYear() === data.getFullYear()
          );
          const valor = receitasMes.reduce((acc, r) => acc + r.valor, 0);
          return {
            mes,
            valor,
            meta: valor * 1.1 // Meta 10% acima do realizado
          };
        });

        setPeriodos([
          {
            label: 'Últimos 6 meses',
            dados: dados6Meses
          },
          {
            label: 'Último ano',
            dados: dados12Meses
          }
        ]);

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados do gráfico');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user, empresaSelecionada]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  const dadosAtuais = periodos[periodoAtual].dados;
  const maiorValor = Math.max(...dadosAtuais.map(d => Math.max(d.valor, d.meta)));
  const alturaGrafico = 200;
  const totalFaturamento = dadosAtuais.reduce((acc, curr) => acc + curr.valor, 0);
  const mediaFaturamento = totalFaturamento / dadosAtuais.length;
  const ultimoMes = dadosAtuais[dadosAtuais.length - 1];
  const penultimoMes = dadosAtuais[dadosAtuais.length - 2];
  const crescimento = penultimoMes.valor === 0 ? 0 : ((ultimoMes.valor - penultimoMes.valor) / penultimoMes.valor) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Faturamento Mensal</h2>
          <p className="text-sm text-gray-500 mt-1">Análise de desempenho por período</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriodoAtual(prev => (prev > 0 ? prev - 1 : periodos.length - 1))}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 font-medium">{periodos[periodoAtual].label}</span>
          <button
            onClick={() => setPeriodoAtual(prev => (prev < periodos.length - 1 ? prev + 1 : 0))}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Total no Período</p>
          <p className="text-xl font-semibold text-gray-900">{formataMoeda(totalFaturamento)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Média Mensal</p>
          <p className="text-xl font-semibold text-gray-900">{formataMoeda(mediaFaturamento)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Crescimento</p>
          <p className="text-xl font-semibold text-gray-900">{crescimento.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="relative h-[200px] mt-8">
        <div className="absolute inset-0 flex items-end justify-between">
          {dadosAtuais.map((item, index) => (
            <div key={index} className="flex flex-col items-center" style={{ width: `${100 / dadosAtuais.length}%` }}>
              {/* Meta */}
              <div className="w-full flex justify-center mb-1">
                <div className="w-12 border-t-2 border-dashed border-gray-300" style={{ marginTop: `${(1 - item.meta / maiorValor) * alturaGrafico}px` }} />
              </div>
              
              {/* Barra de valor */}
              <div 
                className="w-12 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 relative group"
                style={{ height: `${(item.valor / maiorValor) * alturaGrafico}px` }}
              > 
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap transition-opacity">
                  {formataMoeda(item.valor)}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">{item.mes}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center text-green-500">
          <TrendingUp size={16} className="mr-1" />
          <span>{crescimento === 0 ? '0' : (crescimento > 0 ? '+' : '') + crescimento.toFixed(1)}% vs. mês anterior</span>
        </div>
        <div className="text-gray-500">
          Total: {formataMoeda(totalFaturamento)}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded" />
            <span>Faturamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 border-t-2 border-dashed border-gray-300" />
            <span>Meta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoFaturamento;