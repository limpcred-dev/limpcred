import { collection, doc, addDoc, updateDoc, query, where, getDocs, getDoc, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Processo, ProcessoCreate } from '../types';

class ProcessosService {
  private collection = 'processos';

  private processTimestamp(data: any): any {
    if (data instanceof Timestamp) {
      return data.toDate();
    }
    if (data && typeof data === 'object') {
      return Object.entries(data).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: this.processTimestamp(value)
      }), {});
    }
    return data;
  }

  async criar(dados: ProcessoCreate): Promise<Processo> {
    if (!dados.empresaId) {
      throw new Error('Empresa não selecionada');
    }

    if (!dados.clienteId || !dados.responsavelId || !dados.tipo || !dados.valor) {
      throw new Error('Todos os campos obrigatórios devem ser preenchidos');
    }

    const processosRef = collection(db, this.collection);

    try {
      const ano = new Date().getFullYear();
      const numeroQuery = query(
        processosRef,
        where('empresaId', '==', dados.empresaId),
        where('dataAbertura', '>=', Timestamp.fromDate(new Date(ano, 0, 1))),
        orderBy('dataAbertura', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(numeroQuery);
      let sequencial = 1;

      if (!querySnapshot.empty) {
        const ultimoProcesso = querySnapshot.docs[0].data() as Processo;
        const ultimoNumero = parseInt(ultimoProcesso.numero?.split('-')[2] || '0', 10);
        sequencial = ultimoNumero + 1;
      }

      const novoProcesso = {
        ...dados,
        numero: `PROC-${ano}-${sequencial.toString().padStart(4, '0')}`,
        status: 'aberto',
        dataAbertura: Timestamp.now(),
        dataVencimento: Timestamp.fromDate(dados.dataVencimento),
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      };

      const docRef = await addDoc(processosRef, novoProcesso);

      return {
        id: docRef.id,
        ...novoProcesso,
        dataAbertura: new Date(),
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      } as Processo;
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      throw new Error('Não foi possível criar o processo. Tente novamente.');
    }
  }

  async listarPorEmpresa(empresaId: string): Promise<Processo[]> {
    if (!empresaId?.trim()) {
      throw new Error('ID da empresa é obrigatório');
    }

    try {
      const processosRef = collection(db, this.collection);
      const q = query(
        processosRef,
        where('empresaId', '==', empresaId),
        orderBy('dataAbertura', 'desc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.processTimestamp(doc.data())
      })) as Processo[];
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        throw new Error('Sem permissão para acessar os processos desta empresa');
      }
      if (error.code === 'unavailable') {
        throw new Error('Conexão indisponível. Verifique sua internet.');
      }
      throw new Error('Erro ao carregar processos. Tente novamente.');
    }
  }

  async buscarPorId(id: string): Promise<Processo | null> {
    try {
      const docRef = doc(db, this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...this.processTimestamp(docSnap.data())
      } as Processo;
    } catch (error) {
      console.error('Erro ao buscar processo:', error);
      throw new Error('Erro ao buscar processo. Tente novamente.');
    }
  }

  async atualizar(id: string, dados: Partial<Processo>): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      const updateData = { ...dados };

      if (dados.dataVencimento) {
        updateData.dataVencimento = Timestamp.fromDate(dados.dataVencimento);
      }

      updateData.dataAtualizacao = serverTimestamp();

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      throw new Error('Erro ao atualizar processo. Tente novamente.');
    }
  }

  async cancelar(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      await updateDoc(docRef, { 
        status: 'cancelado',
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao cancelar processo:', error);
      throw new Error('Erro ao cancelar processo. Tente novamente.');
    }
  }
}

export const processosService = new ProcessosService();