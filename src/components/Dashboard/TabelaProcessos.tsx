import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { Processo } from '../../types/processo';
import ProcessoDetalhes from '../../pages/vendedor/Processos/ProcessoDetalhes';
import { formataMoeda } from '../../utils/formatadores';

const statusIcons = {
  pendente: <AlertCircle className="text-yellow-500" size={20} />,
  em_analise: <Clock className="text-blue-500" size={20} />,
  aprovado: <CheckCircle className="text-green-500" size={20} />,
  rejeitado: <XCircle className="text-red-500" size={20} />,
  cancelado: <XCircle className="text-gray-500" size={20} />
};

interface TabelaProcessosProps {
  processos: Processo[];
}

export default function TabelaProcessos({ processos }: TabelaProcessosProps) {
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo | null>(null);
  const processosValidos = Array.isArray(processos) ? processos : [];

  // Verificar se processos existe e é um array
  if (!processos || !Array.isArray(processos)) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nenhum processo encontrado
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processosValidos.length > 0 ? processosValidos.map((processo) => (
              <tr key={processo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {processo.clienteNome}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {processo.clienteDocumento}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {statusIcons[processo.status as keyof typeof statusIcons]}
                    <span className="ml-2 text-sm text-gray-600 capitalize">
                      {processo.status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formataMoeda(processo.valor)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {processo.dataCriacao.toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{processo.vendedorNome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setProcessoSelecionado(processo)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhum processo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {processoSelecionado && (
        <ProcessoDetalhes
          processo={processoSelecionado}
          onClose={() => setProcessoSelecionado(null)}
        />
      )}
    </div>
  );
}