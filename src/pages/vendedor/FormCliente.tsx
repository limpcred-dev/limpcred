import React, { useState } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { clientesService } from '../../services/clientes';
import { buscarCEP } from '../../services/cep';
import { maskCPFCNPJ, maskWhatsapp, maskCEP } from '../../utils/masks';
import { Cliente } from '../../types/cliente';

interface FormClienteProps {
  cliente?: Cliente | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormCliente({ cliente, onClose, onSuccess }: FormClienteProps) {
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [documentos, setDocumentos] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    documento: cliente?.documento || '',
    whatsapp: cliente?.whatsapp || '',
    endereco: {
      cep: cliente?.endereco.cep || '',
      logradouro: cliente?.endereco.logradouro || '',
      numero: cliente?.endereco.numero || '',
      complemento: cliente?.endereco.complemento || '',
      bairro: cliente?.endereco.bairro || '',
      cidade: cliente?.endereco.cidade || '',
      estado: cliente?.endereco.estado || ''
    }
  });

  const handleCEPSearch = async (cep: string) => {
    const cepFormatted = maskCEP(cep);
    setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, cep: cepFormatted } }));

    if (cepFormatted.length === 9) {
      setCepLoading(true);
      setError('');
      
      try {
        const endereco = await buscarCEP(cepFormatted);
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf,
            cep: cepFormatted
          }
        }));
      } catch (err) {
        setError('CEP não encontrado');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleDocumentosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentos(prev => [...prev, ...files]);
  };

  const removeDocumento = (index: number) => {
    setDocumentos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !empresaSelecionada) return;

    setLoading(true);
    setError('');

    const dadosAtualizados = {
      ...formData,
      vendedorId: user.uid,
      empresaId: empresaSelecionada.id,
      status: 'ativo' as const
    };

    try {
      if (cliente) {
        await clientesService.atualizar(cliente.id, formData, documentos);
      } else {
        await clientesService.criar(formData, documentos);
      }

      onSuccess();
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      setError(`Erro ao ${cliente ? 'atualizar' : 'cadastrar'} cliente. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={maskCPFCNPJ(formData.documento)}
            onChange={(e) => setFormData({ ...formData, documento: e.target.value.replace(/\D/g, '') })}
            maxLength={18}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
          <input
            type="tel"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={maskWhatsapp(formData.whatsapp)}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
            maxLength={15}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">CEP</label>
            <input
              type="text"
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                cepLoading ? 'bg-gray-100' : 'border-gray-300'
              }`}
              value={maskCEP(formData.endereco.cep)}
              onChange={(e) => handleCEPSearch(e.target.value)}
              maxLength={9}
              disabled={cepLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Número</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.endereco.numero}
              onChange={(e) => setFormData({
                ...formData,
                endereco: { ...formData.endereco, numero: e.target.value }
              })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logradouro</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.endereco.logradouro}
            onChange={(e) => setFormData({
              ...formData,
              endereco: { ...formData.endereco, logradouro: e.target.value }
            })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bairro</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.endereco.bairro}
              onChange={(e) => setFormData({
                ...formData,
                endereco: { ...formData.endereco, bairro: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Complemento</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.endereco.complemento}
              onChange={(e) => setFormData({
                ...formData,
                endereco: { ...formData.endereco, complemento: e.target.value }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cidade</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.endereco.cidade}
              onChange={(e) => setFormData({
                ...formData,
                endereco: { ...formData.endereco, cidade: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
              value={formData.endereco.estado}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Documentos</label>
          <div className="mt-1 flex items-center">
            <label className="block w-full">
              <span className="sr-only">Escolher arquivo</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleDocumentosChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-dark"
              />
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Formatos aceitos: PDF, JPG, PNG. Você pode selecionar múltiplos arquivos.
          </p>
          
          {/* Lista de arquivos selecionados */}
          {documentos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Arquivos selecionados:</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {documentos.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocumento(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Salvando...' : cliente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </button>
      </div>
    </form>
  );
}