import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { receitasService, despesasService } from '../../services/financeiro';
import { formataMoeda } from '../../utils/formatadores';

interface FluxoCaixaData {
  entradas: number;
  saidas: number;
  saldo: number;
  ultimasTransacoes: {
    id: string;
    tipo: 'entrada' | 'saida';
    descricao: string;
    valor: number;
    data: Date;
  }[];
}

const FluxoCaixa = () => {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<FluxoCaixaData>({
    entradas: 85000,
    saidas: 35000,
    saldo: 50000,
    ultimasTransacoes: []
  });

  useEffect(() => {
    const carregarDados = async () => {
      if (!user || !empresaSelecionada) return;

      try {
        setLoading(true);
        setError(null);

        // Carregar receitas e despesas
        const [receitas, despesas] = await Promise.all([
          receitasService.listarPorUsuario(user.uid),
          despesasService.listarPorEmpresa(empresaSelecionada.id)
        ]);

        // Calcular totais
        const totalEntradas = receitas.reduce((acc, r) => acc + r.valor, 0);
        const totalSaidas = despesas.reduce((acc, d) => acc + d.valor, 0);

        // Preparar últimas transações
        const todasTransacoes = [
          ...receitas.map(r => ({
            id: r.id,
            tipo: 'entrada' as const,
            descricao: r.descricao,
            valor: r.valor,
            data: r.data
          })),
          ...despesas.map(d => ({
            id: d.id,
            tipo: 'saida' as const,
            descricao: d.descricao,
            valor: d.valor,
            data: d.data
          }))
        ].sort((a, b) => b.data.getTime() - a.data.getTime())
         .slice(0, 4); // Pegar apenas as 4 últimas transações

        setDados({
          entradas: totalEntradas,
          saidas: totalSaidas,
          saldo: totalEntradas - totalSaidas,
          ultimasTransacoes: todasTransacoes
        });
      } catch (err) {
        console.error('Erro ao carregar dados do fluxo de caixa:', err);
        setError('Não foi possível carregar os dados do fluxo de caixa');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user, empresaSelecionada]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Fluxo de Caixa</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 p-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Entradas</p>
              <p className="text-2xl font-bold text-green-700">
                {formataMoeda(dados.entradas)}
              </p>
            </div>
            <ArrowUpCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Saídas</p>
              <p className="text-2xl font-bold text-red-700">
                {formataMoeda(dados.saidas)}
              </p>
            </div>
            <ArrowDownCircle className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Saldo</p>
              <p className="text-2xl font-bold text-blue-700">
                {formataMoeda(dados.saldo)}
              </p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Últimas Transações</h3>
        <div className="space-y-3">
          {dados.ultimasTransacoes.map((transacao) => (
            <div key={transacao.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {transacao.tipo === 'entrada' ? (
                  <ArrowUpCircle className="text-green-500 mr-3" size={20} />
                ) : (
                  <ArrowDownCircle className="text-red-500 mr-3" size={20} />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">{transacao.descricao}</p>
                  <p className="text-xs text-gray-500">{transacao.data.toLocaleDateString()}</p>
                </div>
              </div>
              <p className={`text-sm font-medium ${
                transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formataMoeda(transacao.valor)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixa;