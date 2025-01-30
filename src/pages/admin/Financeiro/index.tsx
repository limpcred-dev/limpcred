import React, { useState } from 'react';
import { Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import ResumoFinanceiro from './ResumoFinanceiro';
import FluxoCaixaChart from './FluxoCaixaChart';
import UltimasTransacoes from './UltimasTransacoes';
import ContasBancarias from './ContasBancarias';
import CartaoCredito from './CartaoCredito';
import CentroCustos from './CentroCustos';
import FormReceita from './Receitas/FormReceita';
import FormDespesa from './Despesas/FormDespesa';

interface FinanceiroProps {
  key?: number;
}

export default function Financeiro() {
  const [showReceitaForm, setShowReceitaForm] = useState(false);
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNovaReceita = () => {
    setShowReceitaForm(true);
  };

  const handleNovaDespesa = () => {
    setShowDespesaForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowReceitaForm(false);
    setShowDespesaForm(false);
    setRefreshKey(prev => prev + 1); // Force refresh of child components
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
        <div className="flex gap-2">
          <button
            onClick={handleNovaReceita}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Nova Receita
          </button>
          <button
            onClick={handleNovaDespesa}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Nova Despesa
          </button>
        </div>
      </div>

      {showReceitaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nova Receita</h2>
            <FormReceita
              onClose={() => setShowReceitaForm(false)}
              onSuccess={handleTransactionSuccess}
            />
          </div>
        </div>
      )}

      {showDespesaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nova Despesa</h2>
            <FormDespesa
              onClose={() => setShowDespesaForm(false)}
              onSuccess={handleTransactionSuccess}
            />
          </div>
        </div>
      )}

      <ResumoFinanceiro key={`resumo-${refreshKey}`} />

      <div className="grid grid-cols-1 gap-6">
        <ContasBancarias />
        <CartaoCredito />
        <CentroCustos />
      </div>

      <UltimasTransacoes key={`transacoes-${refreshKey}`} />
    </div>
  );
}