import React from 'react';
import { FolderTree, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { formataMoeda } from '../../../../utils/formatadores';
import { CentroCusto } from '../../../../types/financeiro';

interface ListaCentrosProps {
  centros: CentroCusto[];
  loading: boolean;
  onEdit: (centro: CentroCusto) => void;
}

export default function ListaCentros({ centros, loading, onEdit }: ListaCentrosProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Organize centers into a hierarchy
  const organizeCenters = (centers: CentroCusto[]) => {
    const mainCenters = centers.filter(c => !c.centroPaiId);
    const subCenters = centers.filter(c => c.centroPaiId);
    
    return mainCenters.map(center => ({
      ...center,
      subcentros: subCenters.filter(sub => sub.centroPaiId === center.id)
    }));
  };

  const renderCentro = (centro: CentroCusto & { subcentros?: CentroCusto[] }, nivel = 0) => (
    <React.Fragment key={centro.id}>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${nivel * 2}rem` }}>
            {(centro.subcentros?.length || 0) > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
            )}
            <FolderTree className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{centro.nome}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            centro.tipo === 'despesa' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {centro.tipo === 'despesa' ? 'Despesa' : 'Receita'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formataMoeda(centro.orcamento)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            centro.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {centro.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(centro)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {centro.subcentros?.map(sub => renderCentro(sub, nivel + 1))}
    </React.Fragment>
  );

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orçamento
              </th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizeCenters(centros).map((centro) => renderCentro(centro))}
            {centros.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhum centro de custo cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}