import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FormCentroProps {
  onClose: () => void;
}

export default function FormCentro({ onClose }: FormCentroProps) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'despesa',
    descricao: '',
    centroPai: '',
    orcamento: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de salvamento
    onClose();
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Centro de Custo Pai</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.centroPai}
            onChange={(e) => setFormData({ ...formData, centroPai: e.target.value })}
          >
            <option value="">Nenhum (Principal)</option>
            <option value="1">Administrativo</option>
            <option value="2">Operacional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Orçamento Mensal</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.orcamento}
            onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
          />
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}