import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Phone, Mail, MapPin, Eye, Calendar, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { clientesService } from '../../services/clientes';
import { Cliente } from '../../types/cliente';
import { maskCPFCNPJ, maskWhatsapp } from '../../utils/masks';
import FormCliente from './FormCliente';
import EmpresaRequired from '../../components/EmpresaRequired';
import ClienteDetalhes from './ClienteDetalhes';

export default function MeusClientes() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();

  const carregarClientes = async () => {
    if (!user || !empresaSelecionada) return;
    
    try {
      setError(null);
      const lista = await clientesService.listarPorVendedorEEmpresa(user.uid, empresaSelecionada.id);
      setClientes(lista);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Não foi possível carregar os clientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, [user, empresaSelecionada]);

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.whatsapp.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <EmpresaRequired>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Meus Clientes</h1>
          {clientes.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              Novo Cliente
            </button>
          )}
        </div>

        {showForm || clienteParaEditar ? (
          <FormCliente 
            cliente={clienteParaEditar}
            onClose={() => {
              setShowForm(false);
              setClienteParaEditar(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setClienteParaEditar(null);
              carregarClientes();
            }}
          />
        ) : clientes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum cliente cadastrado
            </h2>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro cliente para gerenciar seus processos.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF/CNPJ, email ou WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{cliente.nome}</h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cliente.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setClienteSelecionado(cliente)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Visualizar cliente"
                        >
                          <Eye className="w-5 h-5 text-gray-500 hover:text-primary" />
                        </button>
                        <button
                          onClick={() => setClienteParaEditar(cliente)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-5 h-5 text-gray-500 hover:text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{cliente.email}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{maskWhatsapp(cliente.whatsapp)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{cliente.dataCadastro.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{cliente.endereco.cidade}/{cliente.endereco.estado}</span>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      CPF/CNPJ: <span className="font-medium">{maskCPFCNPJ(cliente.documento)}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t">
                    <button
                      onClick={() => navigate('/dashboard/processos', { state: { clienteId: cliente.id } })}
                      className="w-full text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      Novo Processo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {clientesFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-gray-500">
                  Tente ajustar sua busca para encontrar o cliente desejado.
                </p>
              </div>
            )}
          </div>
        )}

        {clienteSelecionado && (
          <ClienteDetalhes
            cliente={clienteSelecionado}
            onClose={() => setClienteSelecionado(null)}
          />
        )}
      </div>
    </EmpresaRequired>
  );
}