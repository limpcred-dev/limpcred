import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { receitasService, despesasService } from '../../../services/financeiro';
import { formataMoeda } from '../../../utils/formatadores';

export default function ResumoFinanceiro() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumo, setResumo] = useState({
    saldoAtual: 0,
    receitasMes: 0,
    despesasMes: 0,
    previsaoMes: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Buscar todas as receitas e despesas
        const [receitas, despesas] = await Promise.all([
          receitasService.listarPorUsuario(user.uid),
          despesasService.listarPorEmpresa(user.empresaId)
        ]);

        // Pegar o primeiro dia do mês atual
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        // Filtrar transações do mês atual
        const receitasMes = receitas.filter(r => r.data >= primeiroDiaMes);
        const despesasMes = despesas.filter(d => d.data >= primeiroDiaMes);

        // Calcular totais
        const totalReceitasMes = receitasMes.reduce((total, r) => total + r.valor, 0);
        const totalDespesasMes = despesasMes.reduce((total, d) => total + d.valor, 0);

        // Calcular saldo (todas as receitas - todas as despesas)
        const totalReceitas = receitas.reduce((total, r) => total + r.valor, 0);
        const totalDespesas = despesas.reduce((total, d) => total + d.valor, 0);
        const saldoAtual = totalReceitas - totalDespesas;

        // Calcular previsão para o mês
        // Usando uma média simples baseada nos dias passados do mês
        const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
        const diasPassados = hoje.getDate();
        const previsaoMes = Math.round((totalReceitasMes / diasPassados) * diasNoMes);

        setResumo({
          saldoAtual,
          receitasMes: totalReceitasMes,
          despesasMes: totalDespesasMes,
          previsaoMes
        });
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
        setError('Não foi possível carregar os dados financeiros');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Saldo Atual</p>
            <p className={`text-2xl font-semibold ${
              resumo.saldoAtual >= 0 ? 'text-gray-900' : 'text-red-600'
            }`}>
              {formataMoeda(resumo.saldoAtual)}
            </p>
          </div>
          <div className="p-3 rounded-full bg-blue-100">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Receitas do Mês</p>
            <p className="text-2xl font-semibold text-green-600">
              {formataMoeda(resumo.receitasMes)}
            </p>
          </div>
          <div className="p-3 rounded-full bg-green-100">
            <ArrowUpCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Despesas do Mês</p>
            <p className="text-2xl font-semibold text-red-600">
              {formataMoeda(resumo.despesasMes)}
            </p>
          </div>
          <div className="p-3 rounded-full bg-red-100">
            <ArrowDownCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Previsão do Mês</p>
            <p className="text-2xl font-semibold text-purple-600">
              {formataMoeda(resumo.previsaoMes)}
            </p>
          </div>
          <div className="p-3 rounded-full bg-purple-100">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}