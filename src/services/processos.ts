import { 
  collection, 
  doc, 
  getDoc,
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Processo, ProcessoCreate } from '../types/processo';
import { receitasService, centroCustosService, faturasService } from './financeiro';

export const processosService = {
  async criar(dados: ProcessoCreate, contratoFile?: File, comprovanteFile?: File): Promise<Processo> {
    try {
      // Buscar o documento do cliente
      const clienteDoc = await getDoc(doc(db, 'clientes', dados.clienteId));
      if (!clienteDoc.exists()) {
        throw new Error('Cliente não encontrado');
      }
      const clienteData = clienteDoc.data();
      const clienteDocumento = clienteData.documento;

      if (!dados.vendedorId) {
        throw new Error('Vendedor é obrigatório');
      }

      // Verificar/criar centro de custo pai "Receita Clientes"
      let centroPaiId = '';
      try {
        const centrosPai = await centroCustosService.listarPorUsuario(dados.vendedorId);
        const centroPai = centrosPai.find(c => c.nome === 'Receita Clientes' && c.tipo === 'receita');
        
        if (centroPai) {
          centroPaiId = centroPai.id;
        } else {
          const novoCentroPai = await centroCustosService.criar({
            nome: 'Receita Clientes',
            tipo: 'receita',
            descricao: 'Receitas provenientes de clientes',
            empresaId: dados.empresaId,
            userId: dados.vendedorId,
            status: 'ativo',
            orcamento: 0
          });
          centroPaiId = novoCentroPai.id;
        }

        // Verificar/criar centro de custo do cliente
        const nomeClienteCentro = `Cliente - ${dados.clienteNome}`;
        let centroCustoId = '';
        const centroCliente = centrosPai.find(c => 
          c.nome === nomeClienteCentro && 
          c.tipo === 'receita' && 
          c.centroPaiId === centroPaiId
        );

        if (!centroCliente) {
          const novoCentroCliente = await centroCustosService.criar({
            nome: nomeClienteCentro,
            tipo: 'receita',
            descricao: `Receitas do cliente ${dados.clienteNome}`,
            empresaId: dados.empresaId,
            centroPaiId,
            userId: dados.vendedorId,
            status: 'ativo',
            orcamento: dados.valor // Define o orçamento como o valor total do processo
          });
          centroCustoId = novoCentroCliente.id;
        } else {
          // Atualiza o orçamento do centro de custo existente somando o novo valor
          await centroCustosService.atualizar(centroCliente.id, {
            orcamento: centroCliente.orcamento + dados.valor
          });
          centroCustoId = centroCliente.id;
        }

        let contratoUrl: string | undefined;
        let comprovanteUrl: string | undefined;

        // Upload do contrato
        if (contratoFile) {
          const contratoRef = ref(storage, `contratos/${dados.empresaId}/${Date.now()}_${contratoFile.name}`);
          await uploadBytes(contratoRef, contratoFile);
          contratoUrl = await getDownloadURL(contratoRef);
        }

        // Upload do comprovante
        if (comprovanteFile) {
          const comprovanteRef = ref(storage, `comprovantes/${dados.empresaId}/${Date.now()}_${comprovanteFile.name}`);
          await uploadBytes(comprovanteRef, comprovanteFile);
          comprovanteUrl = await getDownloadURL(comprovanteRef);
        }

        const processoRef = collection(db, 'processos');
        const docRef = await addDoc(processoRef, {
          ...dados,
          status: 'Pendentes de envio',
          clienteDocumento, // Adiciona o documento do cliente
          contratoUrl,
          comprovanteUrl,
          dataCriacao: serverTimestamp(),
          dataAtualizacao: serverTimestamp()
        });

        // Criar faturas para as parcelas
        if (dados.numeroParcelas > 1) {
          const valorParcela = (dados.valor - dados.valorEntrada) / dados.numeroParcelas;
          const hoje = new Date();
          
          console.log('Criando faturas para processo:', {
            processoId: docRef.id,
            valorTotal: dados.valor,
            valorEntrada: dados.valorEntrada,
            numeroParcelas: dados.numeroParcelas,
            valorParcela,
            dataInicial: hoje
          });
          
          // Criar uma fatura para cada parcela
          for (let i = 1; i <= dados.numeroParcelas; i++) {
            const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + i, hoje.getDate());
            
            console.log(`Criando fatura ${i}/${dados.numeroParcelas}:`, {
              processoId: docRef.id,
              clienteId: dados.clienteId,
              clienteNome: dados.clienteNome,
              valor: valorParcela,
              dataVencimento: dataVencimento.toISOString(),
              metodoPagamento: dados.metodoPagamento
            });

            await faturasService.criar({
              processoId: docRef.id,
              clienteId: dados.clienteId,
              clienteNome: dados.clienteNome,
              empresaId: dados.empresaId,
              valor: valorParcela,
              numeroParcela: i,
              totalParcelas: dados.numeroParcelas,
              dataVencimento,
              status: 'pendente',
              metodoPagamento: dados.metodoPagamento,
              observacoes: `Parcela ${i} de ${dados.numeroParcelas} - ${dados.nome}`
            });

            console.log(`Fatura ${i} criada com sucesso`);
          }
          
          console.log('Todas as faturas foram criadas com sucesso');
        }
        
        // Se houver valor de entrada, criar uma receita
        if (dados.valorEntrada > 0) {
          console.log('Criando receita para entrada:', {
            valor: dados.valorEntrada,
            centroCustoId,
            processoId: docRef.id
          });

          await receitasService.criar({
            descricao: `Entrada do processo ${docRef.id} - ${dados.nome}`,
            valor: dados.valorEntrada,
            data: new Date(),
            empresaId: dados.empresaId,
            centroCustoId,
            userId: dados.vendedorId, // Mantém apenas o userId
            status: 'ativo',
            observacoes: `Entrada referente ao processo ${docRef.id} - Cliente: ${dados.clienteNome}`
          });

          console.log('Receita de entrada criada com sucesso');
        }

        return {
          id: docRef.id,
          ...dados,
          status: 'Pendentes de envio',
          contratoUrl,
          comprovanteUrl,
          dataCriacao: new Date(),
          dataAtualizacao: new Date()
        };
      } catch (err) {
        console.error('Erro ao criar centros de custo:', err);
        throw new Error('Erro ao configurar centros de custo para o processo');
      }
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      throw new Error(error instanceof Error ? error.message : 'Não foi possível criar o processo');
    }
  },

  async listarPorVendedor(vendedorId: string): Promise<Processo[]> {
    try {
      const q = query(
        collection(db, 'processos'),
        where('vendedorId', '==', vendedorId)
      );
      
      const snapshot = await getDocs(q);
      const processos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCriacao: doc.data().dataCriacao?.toDate(),
        dataAtualizacao: doc.data().dataAtualizacao?.toDate()
      })) as Processo[];
      
      // Sort locally instead of using orderBy to avoid index requirement
      return processos.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
    } catch (error) {
      console.error('Erro ao listar processos:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Erro de configuração do sistema. Entre em contato com o suporte.');
      }
      throw new Error('Não foi possível carregar os processos');
    }
  },

  async listarPorEmpresa(empresaId: string): Promise<Processo[]> {
    try {
      if (!empresaId) {
        throw new Error('ID da empresa é obrigatório');
      }

      const q = query(
        collection(db, 'processos'),
        where('empresaId', '==', empresaId)
      );
      
      const snapshot = await getDocs(q);
      const processos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataCriacao: data.dataCriacao?.toDate() || new Date(),
          dataAtualizacao: data.dataAtualizacao?.toDate() || new Date()
        } as Processo;
      });
      
      // Sort by creation date, newest first
      return processos.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
    } catch (error) {
      console.error('Erro ao listar processos:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Erro de configuração do sistema. Entre em contato com o suporte.');
      }
      throw new Error('Não foi possível carregar os processos');
    }
  },

  async atualizar(id: string, dados: Partial<Processo>): Promise<void> {
    try {
      const docRef = doc(db, 'processos', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      throw new Error('Não foi possível atualizar o processo');
    }
  }
};