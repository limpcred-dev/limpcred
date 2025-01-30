import React from 'react';
import { Building2, Edit2, Check } from 'lucide-react';
import { Empresa } from '../../../types/empresa';
import { useEmpresa } from '../../../contexts/EmpresaContext';

interface ListaEmpresasProps {
  empresas: Empresa[];
}

export default function ListaEmpresas({ empresas }: ListaEmpresasProps) {
  const { empresaSelecionada, selecionarEmpresa } = useEmpresa();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {empresas.map((empresa) => (
        <div
          key={empresa.id}
          className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
            empresaSelecionada?.id === empresa.id ? 'border-blue-500' : 'border-transparent'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {empresa.logo ? (
                <img
                  src={empresa.logo}
                  alt={empresa.nomeFantasia}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{empresa.nomeFantasia}</h3>
                <p className="text-sm text-gray-500">{empresa.cnpj}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>{empresa.email}</p>
            <p>{empresa.telefone}</p>
            <p className="text-xs">
              {empresa.endereco.cidade}, {empresa.endereco.estado}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => selecionarEmpresa(empresa)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg ${
                empresaSelecionada?.id === empresa.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {empresaSelecionada?.id === empresa.id ? (
                <>
                  <Check className="w-4 h-4" />
                  Selecionada
                </>
              ) : (
                'Selecionar Empresa'
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}