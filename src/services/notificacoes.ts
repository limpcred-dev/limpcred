import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';
import { db } from '../config/firebase';

interface Notificacao {
  userId: string;
  titulo: string;
  mensagem: string;
  tipo: 'processo' | 'suporte' | 'sistema';
  lida: boolean;
  dataCriacao: Date;
}

export const salvarTokenNotificacao = async (userId: string, token: string) => {
  try {
    const tokensRef = collection(db, 'tokens_notificacao');
    await addDoc(tokensRef, {
      userId,
      token,
      plataforma: Platform.OS,
      dataCriacao: new Date()
    });
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    throw error;
  }
};

export const registrarNotificacao = async (dados: Omit<Notificacao, 'dataCriacao' | 'lida'>) => {
  try {
    const notificacoesRef = collection(db, 'notificacoes');
    await addDoc(notificacoesRef, {
      ...dados,
      lida: false,
      dataCriacao: new Date()
    });
  } catch (error) {
    console.error('Erro ao registrar notificação:', error);
    throw error;
  }
};

export const buscarNotificacoes = async (userId: string) => {
  try {
    const notificacoesRef = collection(db, 'notificacoes');
    const q = query(
      notificacoesRef,
      where('userId', '==', userId),
      orderBy('dataCriacao', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Notificacao & { id: string })[];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
};