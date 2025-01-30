import React from 'react';
import { X, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Cliente } from '../../types/cliente';
import { maskCPFCNPJ, maskWhatsapp } from '../../utils/masks';

interface ClienteDetalhesProps {
  cliente: Cliente;
  onClose: () => void;
}

export default function ClienteDetalhes({ cliente, onClose }: ClienteDetalhesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{cliente.nome}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">CPF/CNPJ</h3>
              <p className="text-base text-gray-900">{maskCPFCNPJ(cliente.documento)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                cliente.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contato</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{cliente.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{maskWhatsapp(cliente.whatsapp)}</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-600">
                    {cliente.endereco.logradouro}, {cliente.endereco.numero}
                    {cliente.endereco.complemento && ` - ${cliente.endereco.complemento}`}
                  </p>
                  <p className="text-gray-600">
                    {cliente.endereco.bairro}
                  </p>
                  <p className="text-gray-600">
                    {cliente.endereco.cidade} - {cliente.endereco.estado}
                  </p>
                  <p className="text-gray-600">
                    CEP: {cliente.endereco.cep}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data de Cadastro */}
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Cadastrado em: {cliente.dataCadastro.toLocaleDateString()}
            </span>
          </div>

          {/* Documentos */}
          {cliente.documentos && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
              <div className="grid grid-cols-2 gap-4">
                {cliente.documentos.rgCnh && (
                  <a
                    href={cliente.documentos.rgCnh}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark flex items-center gap-2"
                  >
                    <span>Visualizar RG/CNH</span>
                  </a>
                )}
                {cliente.documentos.comprovanteResidencia && (
                  <a
                    href={cliente.documentos.comprovanteResidencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark flex items-center gap-2"
                  >
                    <span>Visualizar Comprovante de Residência</span>
                  </a>
                )}
              </div>
            </div>
          )}
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