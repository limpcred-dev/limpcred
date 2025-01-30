import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { useAuth } from '../../../hooks/useAuth';
import { usuariosService } from '../../../services/usuarios';
import { buscarCEP } from '../../../services/cep';
import { maskCPFCNPJ, maskWhatsapp, maskCEP } from '../../../utils/masks';
import { Usuario, UsuarioCreate, TipoUsuario } from '../../../types/usuario';

interface FormUsuarioProps {
  usuario?: Usuario | null;
  onClose: () => void;
}

const tiposUsuario: { value: TipoUsuario; label: string }[] = [
  { value: 'gestor', label: 'Gestor' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'cliente', label: 'Cliente' }
];

export default function FormUsuario({ usuario, onClose }: FormUsuarioProps) {
  const { empresaSelecionada } = useEmpresa();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UsuarioCreate>({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    whatsapp: usuario?.whatsapp || '',
    documento: usuario?.documento || '',
    endereco: usuario?.endereco || {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    },
    senha: '',
    tipo: usuario?.tipo || 'colaborador',
    empresaId: empresaSelecionada?.id || '',
    status: usuario?.status || 'ativo',
    foto: usuario?.foto
  });
  const [cepLoading, setCepLoading] = useState(false);

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
    if (!empresaSelecionada) return;

    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      if (usuario) {
        await usuariosService.atualizar(usuario.id, formData);
      } else {
        await usuariosService.criar(formData, user.uid);
      }
      onClose();
    } catch (err) {
      setError('Erro ao salvar usuário. Tente novamente.');
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

      {!usuario && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            minLength={6}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoUsuario })}
          >
            {tiposUsuario.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativo' | 'inativo' })}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
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