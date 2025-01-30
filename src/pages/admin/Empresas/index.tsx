import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import EmpresaList from '../../../components/Admin/EmpresaList';
import FormEmpresa from './FormEmpresa';
import { Empresa } from '../../../types/empresa';

export default function Empresas() {
  const [showForm, setShowForm] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);

  const handleEdit = (empresa: Empresa) => {
    setEmpresaToEdit(empresa);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      {showForm ? (
        <FormEmpresa 
          empresa={empresaToEdit}
          onClose={() => {
            setShowForm(false);
            setEmpresaToEdit(null);
          }} 
        />
      ) : (
        <EmpresaList onEdit={handleEdit} />
      )}
    </div>
  );
}