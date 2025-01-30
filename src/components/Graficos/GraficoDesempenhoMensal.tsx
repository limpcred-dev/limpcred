import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formataMoeda } from '../../utils/formatadores';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DadosMensais {
  mes: string;
  faturamento: number;
  meta: number;
}

interface Props {
  dados: DadosMensais[];
}

export default function GraficoDesempenhoMensal({ dados }: Props) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Desempenho Mensal',
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
    labels: dados.map(d => d.mes),
    datasets: [
      {
        label: 'Faturamento',
        data: dados.map(d => d.faturamento),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Meta',
        data: dados.map(d => d.meta),
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line options={options} data={data} height={300} />
    </div>
  );
}