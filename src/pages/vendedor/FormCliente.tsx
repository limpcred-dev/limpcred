import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !empresaSelecionada) {
      setError('Usuário ou empresa não definidos.');
      return;
    }

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
        await clientesService.atualizar(cliente.id, dadosAtualizados, documentos);
      } else {
        await clientesService.criar(dadosAtualizados, documentos);
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
      <div>
        <label>Nome</label>
        <input type="text" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      </div>
      <div>
        <label>CPF/CNPJ</label>
        <input type="text" value={maskCPFCNPJ(formData.documento)} onChange={(e) => setFormData({ ...formData, documento: e.target.value.replace(/\D/g, '') })} required />
      </div>
      <div>
        <label>WhatsApp</label>
        <input type="tel" value={maskWhatsapp(formData.whatsapp)} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })} required />
      </div>
      <div>
        <label>CEP</label>
        <input type="text" value={maskCEP(formData.endereco.cep)} onChange={(e) => handleCEPSearch(e.target.value)} required />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}
