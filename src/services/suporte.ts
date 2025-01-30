import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface MensagemSuporte {
  userId: string;
  assunto: string;
  mensagem: string;
  dataCriacao: Date;
}

export const enviarMensagemSuporte = async (dados: MensagemSuporte) => {
  try {
    const suporteRef = collection(db, 'mensagens_suporte');
    await addDoc(suporteRef, dados);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};