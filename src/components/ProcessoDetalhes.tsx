import React from 'react';
import { X } from 'lucide-react';
import { formataMoeda } from '../utils/formatadores';
import { Processo } from '../types/processo';

interface ProcessoDetalhesProps {
  processo: Processo;
  onClose: () => void;
}

export default function ProcessoDetalhes({ processo, onClose }: ProcessoDetalhesProps) {
  const valorRestante = processo.valor - processo.valorEntrada;
  const valorParcela = valorRestante > 0 ? valorRestante / processo.numeroParcelas : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{processo.nome}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cliente */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
            <p className="text-base text-gray-900">{processo.clienteNome}</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              processo.status === 'Entregue' ? 'bg-green-100 text-green-800' :
              processo.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
              processo.status === 'Garantia' ? 'bg-purple-100 text-purple-800' :
              processo.status === 'Aguardando conclusão' ? 'bg-gray-100 text-gray-800' :
              processo.status === 'Pendentes de entrega' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {processo.status}
            </span>
          </div>

          {/* Valores */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Valor Total</span>
              <span className="text-sm text-gray-900">{formataMoeda(processo.valor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Valor da Entrada</span>
              <span className="text-sm text-gray-900">{formataMoeda(processo.valorEntrada)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Valor Restante</span>
              <span className="text-sm text-gray-900">{formataMoeda(valorRestante)}</span>
            </div>
            {valorRestante > 0 && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Valor da Parcela ({processo.numeroParcelas}x)
                </span>
                <span className="text-sm text-gray-900">{formataMoeda(valorParcela)}</span>
              </div>
            )}
          </div>

          {/* Método de Pagamento */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Método de Pagamento</h3>
            <p className="text-base text-gray-900 capitalize">{processo.metodoPagamento}</p>
          </div>

          {/* Documentos */}
          <div className="grid grid-cols-2 gap-6">
            {processo.contratoUrl && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contrato</h3>
                <a
                  href={processo.contratoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Visualizar Contrato
                </a>
              </div>
            )}
            {processo.comprovanteUrl && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Comprovante</h3>
                <a
                  href={processo.comprovanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark text-sm"
                >
                  Visualizar Comprovante
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}