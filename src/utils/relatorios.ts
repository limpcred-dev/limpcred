import { formataMoeda } from './formatadores';

const formatarStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    cancelado: 'Cancelado'
  };
  return statusMap[status] || status;
};

export const gerarRelatorioProcessos = (processos: any[], periodo: { inicio: Date; fim: Date }) => {
  const processosFiltrados = processos.filter(p => 
    p.dataCriacao >= periodo.inicio && p.dataCriacao <= periodo.fim
  );

  const totalProcessos = processosFiltrados.length;
  const totalValor = processosFiltrados.reduce((acc, p) => acc + p.valor, 0);
  const processosAprovados = processosFiltrados.filter(p => p.status === 'aprovado').length;
  const taxaAprovacao = totalProcessos > 0 ? (processosAprovados / totalProcessos) * 100 : 0;

  const conteudo = `
RELATÓRIO DE PROCESSOS
Período: ${periodo.inicio.toLocaleDateString()} a ${periodo.fim.toLocaleDateString()}
----------------------------------------

RESUMO:
- Total de Processos: ${totalProcessos}
- Valor Total: ${formataMoeda(totalValor)}
- Processos Aprovados: ${processosAprovados}
- Taxa de Aprovação: ${taxaAprovacao.toFixed(1)}%

PROCESSOS DO PERÍODO:
${processosFiltrados
  .sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime())
  .map(p => `
Processo: ${p.nome}
Data: ${p.dataCriacao.toLocaleDateString()}
Cliente: ${p.clienteNome}
Documento: ${p.clienteDocumento || 'Não informado'}
Status: ${formatarStatus(p.status)}
Valor: ${formataMoeda(p.valor)}
Método de Pagamento: ${p.metodoPagamento}
Entrada: ${formataMoeda(p.valorEntrada)}
Parcelas: ${p.numeroParcelas}x de ${formataMoeda((p.valor - p.valorEntrada) / p.numeroParcelas)}
Observações: ${p.observacoes || 'Nenhuma'}
----------------------------------------`
  ).join('\n')}

Relatório gerado em ${new Date().toLocaleString()}
`;

  return conteudo;
};

export const gerarRelatorioCentroCusto = (centrosCusto: any[], periodo: { inicio: Date; fim: Date }) => {
  const conteudo = `
RELATÓRIO DE ANÁLISE POR CENTRO DE CUSTO
Período: ${periodo.inicio.toLocaleDateString()} a ${periodo.fim.toLocaleDateString()}
----------------------------------------

${centrosCusto.map(centro => `
CENTRO DE CUSTO: ${centro.nome}
Tipo: ${centro.tipo === 'receita' ? 'Centro de Receitas' : 'Centro de Despesas'}
Orçamento: ${formataMoeda(centro.orcamento)}

RESUMO FINANCEIRO:
- Total Receitas: ${formataMoeda(centro.totalReceitas)}
- Total Despesas: ${formataMoeda(centro.totalDespesas)}
- Saldo: ${formataMoeda(centro.saldo)}

TRANSAÇÕES DO PERÍODO:
${[...centro.receitas, ...centro.despesas]
  .filter(t => t.data >= periodo.inicio && t.data <= periodo.fim)
  .sort((a, b) => b.data.getTime() - a.data.getTime())
  .map(t => `${t.data.toLocaleDateString()} - ${t.descricao}: ${formataMoeda(t.valor)}`)
  .join('\n')}
----------------------------------------
`).join('\n')}

Relatório gerado em ${new Date().toLocaleString()}
`;

  return conteudo;
};

export const downloadTxtFile = (content: string, filename: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};