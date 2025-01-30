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
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import { 
  CentroCusto, CentroCustoCreate,
  ContaBancaria, ContaBancariaCreate,
  CartaoCredito, CartaoCreditoCreate,
  Receita, ReceitaCreate,
  Despesa, DespesaCreate
} from '../types/financeiro';

export const centroCustosService = {
  async criar(dados: CentroCustoCreate): Promise<CentroCusto> {
    try {
      if (!dados.userId) {
        throw new Error('Usuário não identificado');
      }
      if (!dados.empresaId) {
        throw new Error('Empresa não identificada');
      }

      const docRef = await addDoc(collection(db, 'centros_custo'), {
        ...dados, 
        status: dados.status || 'ativo',
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...dados,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar centro de custo:', error);
      throw new Error('Não foi possível criar o centro de custo');
    }
  },

  async listarPorUsuario(userId: string): Promise<CentroCusto[]> {
    try {
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const q = query(
        collection(db, 'centros_custo'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const centros = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dataCriacao: data.dataCriacao?.toDate() || new Date(),
          dataAtualizacao: data.dataAtualizacao?.toDate() || new Date()
        } as CentroCusto;
      });

      // Sort locally instead of using orderBy
      return centros.sort((a, b) => a.nome.localeCompare(b.nome));

    } catch (error) {
      console.error('Erro ao listar centros de custo:', error);
      throw error;
    }
  },

  async atualizar(id: string, dados: Partial<CentroCusto>): Promise<void> {
    try {
      const docRef = doc(db, 'centros_custo', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar centro de custo:', error);
      throw new Error('Não foi possível atualizar o centro de custo');
    }
  }
};

export const contasBancariasService = {
  async criar(dados: ContaBancariaCreate): Promise<ContaBancaria> {
    try {
      const docRef = await addDoc(collection(db, 'contas_bancarias'), {
        ...dados,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...dados,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar conta bancária:', error);
      throw new Error('Não foi possível criar a conta bancária');
    }
  },

  async listarPorUsuario(userId: string): Promise<ContaBancaria[]> {
    try {
      const q = query(
        collection(db, 'contas_bancarias'),
        where('userId', '==', userId),
        where('status', '==', 'ativo')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCriacao: doc.data().dataCriacao?.toDate() || new Date(),
        dataAtualizacao: doc.data().dataAtualizacao?.toDate() || new Date()
      })) as ContaBancaria[];
    } catch (error) {
      console.error('Erro ao listar contas bancárias:', error);
      throw new Error('Não foi possível carregar as contas bancárias');
    }
  },

  async atualizar(id: string, dados: Partial<ContaBancaria>): Promise<void> {
    try {
      const docRef = doc(db, 'contas_bancarias', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar conta bancária:', error);
      throw new Error('Não foi possível atualizar a conta bancária');
    }
  }
};

export const cartoesService = {
  async criar(dados: CartaoCreditoCreate): Promise<CartaoCredito> {
    try {
      const docRef = await addDoc(collection(db, 'cartoes_credito'), {
        ...dados,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...dados,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      throw new Error('Não foi possível criar o cartão');
    }
  },

  async listarPorUsuario(userId: string): Promise<CartaoCredito[]> {
    try {
      const q = query(
        collection(db, 'cartoes_credito'),
        where('userId', '==', userId),
        where('status', '==', 'ativo')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCriacao: doc.data().dataCriacao?.toDate(),
        dataAtualizacao: doc.data().dataAtualizacao?.toDate()
      })) as CartaoCredito[];
    } catch (error) {
      console.error('Erro ao listar cartões:', error);
      throw new Error('Não foi possível carregar os cartões');
    }
  },

  async atualizar(id: string, dados: Partial<CartaoCredito>): Promise<void> {
    try {
      const docRef = doc(db, 'cartoes_credito', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw new Error('Não foi possível atualizar o cartão');
    }
  },

  async excluir(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'cartoes_credito', id);
      await updateDoc(docRef, {
        status: 'inativo',
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      throw new Error('Não foi possível excluir o cartão');
    }
  }
};

export const receitasService = {
  async criar(dados: ReceitaCreate): Promise<Receita> {
    try {
      if (!dados.userId) {
        throw new Error('Usuário não identificado');
      }
      if (!dados.empresaId) {
        throw new Error('Empresa não identificada');
      }

      const docRef = await addDoc(collection(db, 'receitas'), {
        ...dados,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...dados,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      throw new Error('Não foi possível criar a receita');
    }
  },

  async listarPorUsuario(userId: string): Promise<Receita[]> {
    try {
      const q = query(
        collection(db, 'receitas')
      );
      
      const snapshot = await getDocs(q);
      const receitas = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            data: data.data?.toDate(),
            dataCriacao: data.dataCriacao?.toDate(),
            dataAtualizacao: data.dataAtualizacao?.toDate()
          } as Receita;
        })
        .filter(receita => receita.userId === userId);
      
      // Sort locally instead of using orderBy to avoid index requirements
      return receitas.sort((a, b) => b.data.getTime() - a.data.getTime());
    } catch (error) {
      console.error('Erro ao listar receitas:', error);
      throw new Error('Não foi possível carregar as receitas');
    }
  },

  async atualizar(id: string, dados: Partial<Receita>): Promise<void> {
    try {
      const docRef = doc(db, 'receitas', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      throw new Error('Não foi possível atualizar a receita');
    }
  }
};

export const despesasService = {
  async criar(dados: DespesaCreate): Promise<Despesa> {
    try {
      const docRef = await addDoc(collection(db, 'despesas'), {
        ...dados,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...dados,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw new Error('Não foi possível criar a despesa');
    }
  },

  async listarPorEmpresa(empresaId: string): Promise<Despesa[]> {
    try {
      const q = query(
        collection(db, 'despesas')
      );
      
      const snapshot = await getDocs(q);
      const despesas = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            data: data.data?.toDate(),
            dataCriacao: data.dataCriacao?.toDate(),
            dataAtualizacao: data.dataAtualizacao?.toDate()
          } as Despesa;
        })
        .filter(despesa => despesa.empresaId === empresaId)
        .sort((a, b) => b.data.getTime() - a.data.getTime());

      return despesas;
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      throw new Error('Não foi possível carregar as despesas');
    }
  },

  async atualizar(id: string, dados: Partial<Despesa>): Promise<void> {
    try {
      const docRef = doc(db, 'despesas', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw new Error('Não foi possível atualizar a despesa');
    }
  }
};

export const faturasService = {
  async listarPorProcesso(processoId: string): Promise<Fatura[]> {
    try {
      console.log('Iniciando listagem de faturas para processo:', processoId);

      // Primeiro buscar o processo para verificar permissão
      const processoRef = doc(db, 'processos', processoId);
      const processoSnap = await getDoc(processoRef);
      
      if (!processoSnap.exists()) {
        throw new Error('Processo não encontrado');
      }

      const processo = processoSnap.data();
      
      // Verificar se o usuário atual é o vendedor do processo
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      // Se não for o vendedor do processo, não retorna as faturas
      if (processo.vendedorId !== currentUser.uid) {
        return [];
      }

      // Primeiro tenta com a query composta
      try {
        const q = query(
          collection(db, 'faturas'),
          where('processoId', '==', processoId),
          orderBy('numeroParcela', 'asc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dataVencimento: doc.data().dataVencimento?.toDate(),
          dataPagamento: doc.data().dataPagamento?.toDate(),
          dataCriacao: doc.data().dataCriacao?.toDate(),
          dataAtualizacao: doc.data().dataAtualizacao?.toDate()
        })) as Fatura[];
      } catch (queryError) {
        // Se falhar por falta de índice, tenta sem o orderBy
        if (queryError.code === 'failed-precondition') {
          console.log('Índice não encontrado, tentando query simples');
          const q = query(
            collection(db, 'faturas'),
            where('processoId', '==', processoId)
          );
      
      console.log('Query construída:', {
        collection: 'faturas',
        processoId,
        orderBy: 'numeroParcela'
      });

      console.log('Snapshot obtido:', {
        empty: snapshot.empty,
        size: snapshot.size
      });

          const snapshot = await getDocs(q);
          const faturas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dataVencimento: doc.data().dataVencimento?.toDate(),
            dataPagamento: doc.data().dataPagamento?.toDate(),
            dataCriacao: doc.data().dataCriacao?.toDate(),
            dataAtualizacao: doc.data().dataAtualizacao?.toDate()
          })) as Fatura[];
          
          // Ordena localmente
          return faturas.sort((a, b) => a.numeroParcela - b.numeroParcela);
        }
        throw queryError;
      }
    } catch (error) {
      console.error('Erro detalhado ao listar faturas:', {
        error,
        code: error.code,
        message: error.message,
        processoId
      });
      throw error;
    }
  },

  async atualizar(id: string, dados: Partial<Fatura>): Promise<void> {
    try {
      console.log('Iniciando atualização de fatura:', {
        id,
        dados
      });

      // Se o status está sendo alterado para pago, precisamos gerar uma receita
      if (dados.status === 'pago') {
        // Buscar a fatura completa para ter acesso a todos os dados necessários
        const faturaRef = doc(db, 'faturas', id);
        const faturaSnap = await getDoc(faturaRef);
        if (!faturaSnap.exists()) {
          throw new Error('Fatura não encontrada');
        }
        const faturaAtual = faturaSnap.data() as Fatura;

        // Buscar o processo para obter o centro de custo
        const processoRef = doc(db, 'processos', faturaAtual.processoId);
        const processoSnap = await getDoc(processoRef);
        if (!processoSnap.exists()) {
          throw new Error('Processo não encontrado');
        }
        const processo = processoSnap.data();

        // Verificar/criar centro de custo pai "Receita Clientes"
        const centrosPai = await centroCustosService.listarPorUsuario(processo.vendedorId);
        let centroPaiId = '';
        const centroPai = centrosPai.find(c => c.nome === 'Receita Clientes' && c.tipo === 'receita');
        
        if (centroPai) {
          centroPaiId = centroPai.id;
        } else {
          const novoCentroPai = await centroCustosService.criar({
            nome: 'Receita Clientes',
            tipo: 'receita',
            descricao: 'Receitas provenientes de clientes',
            empresaId: processo.empresaId,
            userId: processo.vendedorId,
            status: 'ativo',
            orcamento: 0
          });
          centroPaiId = novoCentroPai.id;
        }

        // Verificar/criar centro de custo do cliente
        const nomeClienteCentro = `Cliente - ${faturaAtual.clienteNome}`;
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
            descricao: `Receitas do cliente ${faturaAtual.clienteNome}`,
            empresaId: processo.empresaId,
            centroPaiId,
            userId: processo.vendedorId,
            status: 'ativo',
            orcamento: faturaAtual.valor
          });
          centroCustoId = novoCentroCliente.id;
        } else {
          centroCustoId = centroCliente.id;
        }

        // Criar a receita
        await receitasService.criar({
          descricao: `Pagamento da parcela ${faturaAtual.numeroParcela}/${faturaAtual.totalParcelas} - Processo ${faturaAtual.processoId}`,
          valor: faturaAtual.valor,
          data: new Date(),
          empresaId: processo.empresaId,
          centroCustoId,
          userId: processo.vendedorId,
          status: 'ativo',
          observacoes: `Pagamento referente à fatura ${id} - Cliente: ${faturaAtual.clienteNome}`
        });

        console.log('Receita gerada com sucesso para a fatura:', id);
      }

      const docRef = doc(db, 'faturas', id);
      await updateDoc(docRef, {
        ...dados,
        dataAtualizacao: serverTimestamp()
      });

      console.log('Fatura atualizada com sucesso:', id);
    } catch (error) {
      console.error('Erro ao atualizar fatura:', {
        error,
        code: error.code,
        message: error.message,
        id
      });
      throw new Error('Não foi possível atualizar a fatura');
    }
  },

  async criar(dados: FaturaCreate): Promise<Fatura> {
    try {
      console.log('Iniciando criação de fatura:', dados);

      const docRef = await addDoc(collection(db, 'faturas'), {
        ...dados,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      });

      console.log('Fatura criada com sucesso:', docRef.id);

      return {
        id: docRef.id,
        ...dados,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar fatura:', {
        error,
        code: error.code,
        message: error.message,
        dados
      });
      throw new Error('Não foi possível criar a fatura');
    }
  }
};