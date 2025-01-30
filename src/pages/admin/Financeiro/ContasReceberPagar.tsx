import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { formataMoeda } from '../../../utils/formatadores';

export default function ContasReceberPagar() {
  const contas = {
    receber: [
      { id: 1, descricao: 'Processo #1234', valor: 2500, vencimento: '15/03/2024' },
      { id: 2, descricao: 'Processo #1235', valor: 3000, vencimento: '20/03/2024' },
    ],
    pagar: [
      { id: 1, descricao: 'Aluguel', valor: 2000, vencimento: '10/03/2024' },
      { id: 2, descricao: 'Salários', valor: 15000, vencimento: '05/03/2024' },
    ]
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contas a Receber/Pagar</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Contas a Receber</h3>
          <div className="space-y-2">
            {contas.receber.map(conta => (
              <div key={conta.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{conta.descricao}</p>
                    <p className="text-xs text-gray-500">Vence em {conta.vencimento}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-green-600">
                  {formataMoeda(conta.valor)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Contas a Pagar</h3>
          <div className="space-y-2">
            {contas.pagar.map(conta => (
              <div key={conta.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{conta.descricao}</p>
                    <p className="text-xs text-gray-500">Vence em {conta.vencimento}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-red-600">
                  {formataMoeda(conta.valor)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}