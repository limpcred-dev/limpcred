import React, { useState, useEffect } from 'react';
import { Plus, FolderTree } from 'lucide-react';
import ListaCentros from './ListaCentros';
import FormCentroCusto from './FormCentroCusto';
import { useEmpresa } from '../../../../contexts/EmpresaContext';
import { useAuth } from '../../../../hooks/useAuth';
import { centroCustosService } from '../../../../services/financeiro';
import { CentroCusto } from '../../../../types/financeiro';

export default function CentroCustos() {
  const [showForm, setShowForm] = useState(false);
  const [centroParaEditar, setCentroParaEditar] = useState<CentroCusto | null>(null);
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const carregarCentros = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const lista = await centroCustosService.listarPorUsuario(user.uid);
      setCentros(lista);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      if (error.code === 'failed-precondition') {
        setError('Aguarde alguns instantes enquanto configuramos o sistema...');
      } else {
        setError('Erro ao carregar centros de custo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCentros();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Centros de Custo</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Centro
        </button>
      </div>

      {showForm ? (
        <div className="p-6">
          <FormCentroCusto
            centroCusto={centroParaEditar}
            onClose={() => {
              setShowForm(false);
              setCentroParaEditar(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setCentroParaEditar(null);
              carregarCentros();
            }}
          />
        </div>
      ) : (
        <ListaCentros
          centros={centros}
          loading={loading}
          onEdit={(centro) => {
            setCentroParaEditar(centro);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}