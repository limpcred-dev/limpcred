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

      // Verificar se os documentos foram enviados e fazer o upload
      for (const file of documentosFiles) {
        const fileRef = ref(storage, `documentos/${dados.empresaId}/${dados.documento}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        documentosUrls.push(url);
      }

      // Verificar se empresaId e vendedorId estão presentes
      if (!dados.empresaId || !dados.vendedorId) {
        throw new Error('É necessário fornecer empresaId e vendedorId');
      }

      const clienteRef = collection(db, 'clientes');
      const docRef = await addDoc(clienteRef, {
        ...dados,
        documentos: documentosUrls,  // Atribuindo os documentos carregados
        dataCadastro: serverTimestamp(),  // Timestamp do cadastro
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

  // Listar clientes por vendedor
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
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível carregar os clientes');
    }
  },

  // Listar clientes por vendedor e empresa
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
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível carregar os clientes');
    }
  },

  // Listar clientes por empresa
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

  // Buscar cliente por ID
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

  // Atualizar dados do cliente
  async atualizar(id: string, dados: Partial<Cliente>, novosDocumentos: File[] = []): Promise<void> {
    try {
      let documentosAtualizados = dados.documentos || [];

      // Upload dos novos documentos, se houver
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

  // Inativar cliente
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
