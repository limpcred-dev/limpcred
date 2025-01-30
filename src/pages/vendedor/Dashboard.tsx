import React from 'react';
import { Users, FileText, TrendingUp } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAuth } from '../../hooks/useAuth';
import EmpresaRequired from '../../components/EmpresaRequired';

export default function VendedorDashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();

  const stats = [
    { title: 'Meus Clientes', value: '24', icon: Users, change: '+3', color: 'primary' },
    { title: 'Processos Ativos', value: '12', icon: FileText, change: '+2', color: 'secondary' },
    { title: 'Taxa de Conversão', value: '68%', icon: TrendingUp, change: '+5%', color: 'primary' },
  ];

  return (
    <EmpresaRequired>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex justify-between items-center mb-2 lg:mb-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Meu Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm p-3 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-${isMobile ? 'base' : 'xl'} font-semibold text-gray-900`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 lg:p-3 rounded-full bg-${stat.color}/10`}>
                  <stat.icon className={`w-4 h-4 lg:w-6 lg:h-6 text-${stat.color}`} />
                </div>
              </div>
              <div className="mt-2 lg:mt-4 flex items-center text-xs lg:text-sm">
                <span className={`text-${stat.color} font-medium`}>
                  {stat.change}
                </span>
                <span className="text-gray-600 ml-1 lg:ml-2">este mês</span>
              </div>
            </div>
          ))}
        </div>

        {/* Últimos Processos e Atividades serão adicionados aqui */}
      </div>
    </EmpresaRequired>
  );
}