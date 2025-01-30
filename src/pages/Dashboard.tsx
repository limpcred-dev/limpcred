import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEmpresa } from '../hooks/useEmpresa';
import { empresasService } from '../services/empresas';
import GraficoFaturamento from '../components/Dashboard/GraficoFaturamento';
import TabelaProcessos from '../components/Dashboard/TabelaProcessos';
import FluxoCaixa from '../components/Dashboard/FluxoCaixa';

const Dashboard = () => {
  const location = useLocation();
  const { selecionarEmpresa } = useEmpresa();

  useEffect(() => {
    const loadEmpresa = async () => {
      if (location.state?.empresaId) {
        try {
          const empresa = await empresasService.buscarPorId(location.state.empresaId);
          if (empresa) {
            selecionarEmpresa(empresa);
          }
        } catch (error) {
          console.error('Erro ao carregar empresa:', error);
        }
      }
    }
    loadEmpresa();
  }, [location.state?.empresaId, selecionarEmpresa]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoFaturamento />
        <FluxoCaixa />
      </div>
      <TabelaProcessos />
    </div>
  );
};

export default Dashboard;