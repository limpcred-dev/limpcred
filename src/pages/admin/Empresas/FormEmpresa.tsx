import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { empresasService } from '../../../services/empresas';
import { buscarCEP } from '../../../services/cep';
import { maskCNPJ, maskPhone, maskCEP } from '../../../utils/masks';
import { EmpresaCreate } from '../../../types/empresa';

interface FormEmpresaProps {
  onClose: () => void;
}

export default function FormEmpresa({ onClose }: FormEmpresaProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<EmpresaCreate>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    status: 'ativa'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await empresasService.criar(formData, user.uid);
      onClose();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
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
          <label className="block text-sm font-medium text-gray-700">Razão Social</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.razaoSocial}
            onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.nomeFantasia}
            onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">CNPJ</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={maskCNPJ(formData.cnpj)}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, '') })}
            maxLength={18}
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Telefone</label>
        <input
          type="tel"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          value={maskPhone(formData.telefone)}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, '') })}
          maxLength={15}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
        
        <div className="grid grid-cols-2 gap-6">
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
            <label className="block text-sm font-medium text-gray-700">CEP</label>
            <input
              type="text"
              value={maskCEP(formData.endereco.cep)}
              onChange={(e) => handleCEPSearch(e.target.value)}
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                cepLoading ? 'bg-gray-100' : 'border-gray-300'
              }`}
              maxLength={9}
              disabled={cepLoading}
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}