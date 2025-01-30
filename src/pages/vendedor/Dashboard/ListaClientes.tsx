import React from 'react';
import { User } from 'lucide-react';
import { Cliente } from '../../../types/cliente';
import { maskCPFCNPJ, maskWhatsapp } from '../../../utils/masks';
import { formataMoeda } from '../../../utils/formatadores';

interface ListaClientesProps {
  clientes: Cliente[];
  processos?: any[];
}

export default function ListaClientes({ clientes, processos = [] }: ListaClientesProps) {
  // Calculate client stats
  const getClientStats = (clienteId: string) => {
    const clienteProcessos = processos.filter(p => p.clienteId === clienteId);
    const ultimaCompra = clienteProcessos.length > 0 
      ? new Date(Math.max(...clienteProcessos.map(p => p.dataCriacao.getTime())))
      : null;
    const totalCompras = clienteProcessos.reduce((total, p) => total + p.valor, 0);
    
    return { ultimaCompra, totalCompras };
  };

  if (clientes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhum cliente cadastrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contato
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Última Compra
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total em Compras
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientes
            .sort((a, b) => {
              const statsA = getClientStats(a.id);
              const statsB = getClientStats(b.id);
              return (statsB.ultimaCompra?.getTime() || 0) - (statsA.ultimaCompra?.getTime() || 0);
            })
            .map((cliente) => {
              const { ultimaCompra, totalCompras } = getClientStats(cliente.id);
              return (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.nome} 
                          <span className="text-xs text-gray-500 ml-2">
                            {maskCPFCNPJ(cliente.documento)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {cliente.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {maskWhatsapp(cliente.whatsapp)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cliente.endereco.cidade}/{cliente.endereco.estado}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ultimaCompra 
                      ? ultimaCompra.toLocaleDateString()
                      : 'Sem compras'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formataMoeda(totalCompras)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cliente.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}