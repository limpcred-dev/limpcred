import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formataMoeda } from '../../utils/formatadores';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DadosFluxoCaixa {
  data: string;
  entradas: number;
  saidas: number;
}

interface Props {
  dados: DadosFluxoCaixa[];
}

export default function GraficoFluxoCaixa({ dados }: Props) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Fluxo de Caixa',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            return `${label}: ${formataMoeda(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formataMoeda(value),
        },
      },
    },
  };

  const data = {
    labels: dados.map(d => d.data),
    datasets: [
      {
        label: 'Entradas',
        data: dados.map(d => d.entradas),
        backgroundColor: '#10B981',
        borderRadius: 6,
      },
      {
        label: 'Saídas',
        data: dados.map(d => d.saidas),
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Bar options={options} data={data} height={300} />
    </div>
  );
}