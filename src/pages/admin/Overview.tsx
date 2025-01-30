import React from 'react';
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import GraficoFaturamento from '../../components/Dashboard/GraficoFaturamento';
import TabelaProcessos from '../../components/Dashboard/TabelaProcessos';
import FluxoCaixa from '../../components/Dashboard/FluxoCaixa';
import EmpresaRequired from '../../components/EmpresaRequired';

export default function Overview() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const stats = [
    { title: 'Total Clientes', value: '156', icon: Users, change: '+12%', color: 'blue' },
    { title: 'Processos Ativos', value: '43', icon: FileText, change: '+8%', color: 'green' },
    { title: 'Faturamento Mensal', value: 'R$ 85.400', icon: DollarSign, change: '+23%', color: 'yellow' },
    { title: 'Taxa de Conversão', value: '64%', icon: TrendingUp, change: '+7%', color: 'purple' },
  ];

  return (
    <EmpresaRequired>
    <div className="space-y-4 lg:space-y-6">
      <div className="flex justify-between items-center mb-2 lg:mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Visão Geral</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-sm p-3 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-${isMobile ? 'base' : 'xl'} font-semibold text-gray-900`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 lg:p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-4 h-4 lg:w-6 lg:h-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="mt-2 lg:mt-4 flex items-center text-xs lg:text-sm">
              <span className={`text-${stat.color}-600 font-medium`}>
                {stat.change}
              </span>
              <span className="text-gray-600 ml-1 lg:ml-2">vs. anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
        <GraficoFaturamento />
        <FluxoCaixa />
      </div>

      <div className="mt-3 lg:mt-6">
        <TabelaProcessos />
      </div>
    </div>
    </EmpresaRequired>
  );
}