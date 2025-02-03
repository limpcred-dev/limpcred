import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Cliente } from '../types/cliente';

export const clientesService = {
  async criar(
    dados: Omit<Cliente, 'id' | 'dataCadastro'>,
    documentosFiles: File[] = []
  ) {
    try {
      const documentosUrls: string[] = [];

      // Upload all documents
      for (const file of documentosFiles) {
        const fileRef = ref(storage, `documentos/${dados.empresaId}/${dados.documento}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        documentosUrls.push(url);
      }

      const clienteRef = collection(db, 'clientes');
      const docRef = await addDoc(clienteRef, {
        ...dados,
        documentos: documentosUrls,
        dataCadastro: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...dados,
        documentos: documentosUrls,
        dataCadastro: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error('Não foi possível criar o cliente');
    }
  },

  async listarPorVendedor(vendedorId: string) {
    try {
      const q = query(
        collection(db, 'clientes'),
        where('vendedorId', '==', vendedorId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate(),
        dataAtualizacao: doc.data().dataAtualizacao?.toDate()
      })) as Cliente[];
    } catch (error) {
      // Check if error is due to missing index
      if (error.code === 'failed-precondition') {
        console.error('Index missing:', error);
        throw new Error('Erro de configuração do sistema. Entre em contato com o suporte.');
      }
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível carregar os clientes');
    }
  },

  async listarPorVendedorEEmpresa(vendedorId: string, empresaId: string) {
    try {
      const q = query(
        collection(db, 'clientes'),
        where('vendedorId', '==', vendedorId),
        where('empresaId', '==', empresaId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate(),
        dataAtualizacao: doc.data().dataAtualizacao?.toDate()
      })) as Cliente[];
    } catch (error) {
      if (error.code === 'failed-precondition') {
        console.error('Index missing:', error);
        throw new Error('Erro de configuração do sistema. Entre em contato com o suporte.');
      }
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível carregar os clientes');
    }
  },

  async listarPorEmpresa(empresaId: string) {
    try {
      const q = query(
        collection(db, 'clientes'),
        where('empresaId', '==', empresaId),
        orderBy('dataCadastro', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate(),
        dataAtualizacao: doc.data().dataAtualizacao?.toDate()
      }));
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível carregar os clientes');
    }
  },

  async buscarPorId(id: string) {
    try {
      const docRef = doc(db, 'clientes', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        dataCadastro: docSnap.data().dataCadastro?.toDate()
      } as Cliente;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw new Error('Não foi possível carregar o cliente');
    }
  },

  async atualizar(id: string, dados: Partial<Cliente>, novosDocumentos: File[] = []): Promise<void> {
    try {
      let documentosAtualizados = dados.documentos || [];

      // Upload new documents
      for (const file of novosDocumentos) {
        const fileRef = ref(storage, `documentos/${dados.empresaId}/${dados.documento}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        documentosAtualizados.push(url);
      }

      const docRef = doc(db, 'clientes', id);
      await updateDoc(docRef, {
        ...dados,
        documentos: documentosAtualizados,
        dataAtualizacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw new Error('Não foi possível atualizar o cliente');
    }
  },

  async inativar(id: string) {
    try {
      const docRef = doc(db, 'clientes', id);
      await updateDoc(docRef, {
        status: 'inativo',
        dataInativacao: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao inativar cliente:', error);
      throw new Error('Não foi possível inativar o cliente');
    }
  }
};