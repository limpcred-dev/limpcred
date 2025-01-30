import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { receitasService, despesasService } from '../../../services/financeiro';
import { formataMoeda } from '../../../utils/formatadores';

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: Date;
}

export default function UltimasTransacoes() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarTransacoes = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        // Carregar receitas e despesas em paralelo
        const [receitas, despesas] = await Promise.all([
          receitasService.listarPorUsuario(user.uid),
          despesasService.listarPorEmpresa(user.empresaId)
        ]);

        const transacoesReceitas = receitas.map(receita => ({
          id: receita.id,
          tipo: 'receita' as const,
          descricao: receita.descricao,
          valor: receita.valor,
          data: receita.data
        }));

        const transacoesDespesas = despesas.map(despesa => ({
          id: despesa.id,
          tipo: 'despesa' as const,
          descricao: despesa.descricao,
          valor: despesa.valor,
          data: despesa.data
        }));

        const todasTransacoes = [...transacoesReceitas, ...transacoesDespesas];

        // Ordenar por data, mais recentes primeiro
        todasTransacoes.sort((a, b) => b.data.getTime() - a.data.getTime()
        );

        // Pegar apenas as 10 últimas transações
        setTransacoes(todasTransacoes.slice(0, 10));
      } catch (err) {
        console.error('Erro ao carregar transações:', err);
        setError('Não foi possível carregar as transações');
      } finally {
        setLoading(false);
      }
    };

    carregarTransacoes();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Últimas Transações</h2>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
          </div>
        ) : transacoes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma transação encontrada</p>
          </div>
        ) : (
        <div className="space-y-4">
          {transacoes.map((transacao) => (
            <div key={transacao.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {transacao.tipo === 'receita' ? (
                  <ArrowUpCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <ArrowDownCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{transacao.descricao}</p>
                  <p className="text-xs text-gray-500">{transacao.data.toLocaleDateString()}</p>
                </div>
              </div>
              <p className={`text-sm font-medium ${
                transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transacao.tipo === 'receita' ? '+' : '-'} {formataMoeda(transacao.valor)}
              </p>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}