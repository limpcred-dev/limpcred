import { useState, useCallback } from 'react';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { processosService } from '../services/processosService';
import { Processo, ProcessoCreate } from '../types';

export function useProcessos() {
  const { empresaSelecionada } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processos, setProcessos] = useState<Processo[]>([]);

  const carregarProcessos = useCallback(async () => {
    if (!empresaSelecionada?.id) {
      setProcessos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lista = await processosService.listarPorEmpresa(empresaSelecionada.id);
      setProcessos(lista);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar processos';
      setError(message);
      console.error('Erro ao carregar processos:', err);
    } finally {
      setLoading(false);
    }
  }, [empresaSelecionada]);

  const criarProcesso = async (dados: ProcessoCreate) => {
    setLoading(true);
    setError(null);

    try {
      const novoProcesso = await processosService.criar(dados);
      setProcessos(prev => [...prev, novoProcesso]);
      return novoProcesso;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar processo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const atualizarProcesso = async (id: string, dados: Partial<Processo>) => {
    setLoading(true);
    setError(null);

    try {
      await processosService.atualizar(id, dados);
      setProcessos(prev => 
        prev.map(p => p.id === id ? { ...p, ...dados } : p)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar processo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelarProcesso = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await processosService.cancelar(id);
      setProcessos(prev =>
        prev.map(p => p.id === id ? { ...p, status: 'cancelado' } : p)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar processo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    processos,
    loading,
    error,
    carregarProcessos,
    criarProcesso,
    atualizarProcesso,
    cancelarProcesso
  };
}