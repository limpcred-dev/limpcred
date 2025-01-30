import React from 'react';
import GraficoFaturamentoConsultor from '../components/Graficos/GraficoFaturamentoConsultor';
import GraficoDesempenhoMensal from '../components/Graficos/GraficoDesempenhoMensal';
import GraficoFluxoCaixa from '../components/Graficos/GraficoFluxoCaixa';

// Dados mockados para exemplo
const dadosConsultores = [
  { nome: 'Maria Silva', faturamento: 45000 },
  { nome: 'João Santos', faturamento: 38000 },
  { nome: 'Ana Oliveira', faturamento: 52000 },
  { nome: 'Pedro Lima', faturamento: 41000 },
];

const dadosMensais = [
  { mes: 'Jan', faturamento: 120000, meta: 100000 },
  { mes: 'Fev', faturamento: 135000, meta: 100000 },
  { mes: 'Mar', faturamento: 128000, meta: 110000 },
  { mes: 'Abr', faturamento: 142000, meta: 110000 },
  { mes: 'Mai', faturamento: 138000, meta: 120000 },
  { mes: 'Jun', faturamento: 155000, meta: 120000 },
];

const dadosFluxoCaixa = [
  { data: '01/03', entradas: 25000, saidas: 18000 },
  { data: '02/03', entradas: 22000, saidas: 15000 },
  { data: '03/03', entradas: 28000, saidas: 20000 },
  { data: '04/03', entradas: 24000, saidas: 16000 },
  { data: '05/03', entradas: 26000, saidas: 19000 },
];

export default function Relatorios() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Relatórios e Análises
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoDesempenhoMensal dados={dadosMensais} />
        <GraficoFaturamentoConsultor dados={dadosConsultores} />
      </div>
      
      <div className="w-full">
        <GraficoFluxoCaixa dados={dadosFluxoCaixa} />
      </div>
    </div>
  );
}