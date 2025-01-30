import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Mail, Phone, MapPin, Eye, Calendar, UserCog } from 'lucide-react';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { usuariosService } from '../../../services/usuarios';
import { Usuario } from '../../../types/usuario';
import FormUsuario from './FormUsuario';
import EmpresaRequired from '../../../components/EmpresaRequired';
import { maskCPFCNPJ, maskWhatsapp } from '../../../utils/masks';

export default function Usuarios() {
  const [showForm, setShowForm] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);
  const { empresaSelecionada } = useEmpresa();

  const carregarUsuarios = async () => {
    if (!empresaSelecionada) return;
    
    try {
      const lista = await usuariosService.listarPorEmpresa(empresaSelecionada.id);
      setUsuarios(lista);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [empresaSelecionada]);

  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.documento.includes(searchTerm) ||
    usuario.whatsapp.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <EmpresaRequired>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          {usuarios.length > 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              Novo Usuário
            </button>
          )}
        </div>

        {showForm ? (
          <FormUsuario
            usuario={usuarioParaEditar}
            onClose={() => {
              setShowForm(false);
              setUsuarioParaEditar(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setUsuarioParaEditar(null);
              carregarUsuarios();
            }}
          />
        ) : usuarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum usuário cadastrado
            </h2>
            <p className="text-gray-500 mb-6">
              Comece cadastrando seu primeiro usuário para gerenciar o acesso ao sistema.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-primary-dark"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Primeiro Usuário
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, documento ou WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{usuario.nome}</h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUsuarioParaEditar(usuario);
                          setShowForm(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <UserCog className="w-5 h-5 text-gray-500 hover:text-primary" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{usuario.email}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{maskWhatsapp(usuario.whatsapp)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{usuario.dataCriacao.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{usuario.endereco.cidade}/{usuario.endereco.estado}</span>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span>CPF/CNPJ: <span className="font-medium">{maskCPFCNPJ(usuario.documento)}</span></span>
                        <span className="capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {usuario.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-500">
                  Tente ajustar sua busca para encontrar o usuário desejado.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </EmpresaRequired>
  );
}