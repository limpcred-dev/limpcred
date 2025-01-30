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

interface DadosConsultor {
  nome: string;
  faturamento: number;
}

interface Props {
  dados: DadosConsultor[];
}

export default function GraficoFaturamentoConsultor({ dados }: Props) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Faturamento por Consultor',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Faturamento: ${formataMoeda(context.raw)}`,
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
    labels: dados.map(d => d.nome),
    datasets: [
      {
        data: dados.map(d => d.faturamento),
        backgroundColor: '#3B82F6',
        hoverBackgroundColor: '#2563EB',
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