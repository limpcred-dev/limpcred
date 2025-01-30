import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Cliente, Consultor } from '../types';

// Serviços para Clientes
export const clientesService = {
  async listar() {
    const snapshot = await getDocs(collection(db, 'clientes'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
  },

  async buscarPorId(id: string) {
    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Cliente : null;
  },

  async criar(cliente: Omit<Cliente, 'id'>) {
    const docRef = await addDoc(collection(db, 'clientes'), cliente);
    return { id: docRef.id, ...cliente };
  },

  async atualizar(id: string, dados: Partial<Cliente>) {
    const docRef = doc(db, 'clientes', id);
    await updateDoc(docRef, dados);
  },

  async excluir(id: string) {
    const docRef = doc(db, 'clientes', id);
    await deleteDoc(docRef);
  }
};

// Serviços para Consultores
export const consultoresService = {
  async listar() {
    const snapshot = await getDocs(collection(db, 'consultores'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultor[];
  },

  async buscarPorId(id: string) {
    const docRef = doc(db, 'consultores', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Consultor : null;
  },

  async criar(consultor: Omit<Consultor, 'id'>) {
    const docRef = await addDoc(collection(db, 'consultores'), consultor);
    return { id: docRef.id, ...consultor };
  },

  async atualizar(id: string, dados: Partial<Consultor>) {
    const docRef = doc(db, 'consultores', id);
    await updateDoc(docRef, dados);
  },

  async excluir(id: string) {
    const docRef = doc(db, 'consultores', id);
    await deleteDoc(docRef);
  },

  async buscarAtivos() {
    const q = query(
      collection(db, 'consultores'),
      where('ativo', '==', true),
      orderBy('nome')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Consultor[];
  }
};