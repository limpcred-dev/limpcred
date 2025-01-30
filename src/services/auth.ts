import { 
  signInWithEmailAndPassword,
  signOut,
  AuthError as FirebaseAuthError
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AuthUser } from '../contexts/AuthContext';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getErrorMessage = (error: FirebaseAuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-disabled':
      return 'Usuário desativado';
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verificando conexão...';
    default:
      return 'Erro ao fazer login. Tente novamente.';
  }
};

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 'auth/network-request-failed' && retries > 0) {
      await delay(RETRY_DELAY);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

export const autenticar = async (email: string, senha: string): Promise<AuthUser> => {
  try {
    if (!email || !senha) {
      throw new AuthError('Email e senha são obrigatórios');
    }

    const resultado = await retryOperation(() => 
      signInWithEmailAndPassword(auth, email, senha)
    );
    
    // Verifica se é um admin
    const adminDoc = await retryOperation(() => 
      getDoc(doc(db, 'admins', resultado.user.uid))
    );

    if (adminDoc.exists()) {
      return {
        ...resultado.user,
        tipo: 'admin'
      } as AuthUser;
    }
    
    // Verifica se é um usuário comum
    const userDoc = await retryOperation(() => 
      getDoc(doc(db, 'users', resultado.user.uid))
    );

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        ...resultado.user,
        tipo: 'user',
        empresaId: userData.empresaId
      } as AuthUser;
    }

    throw new AuthError('Usuário não encontrado no sistema');
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    
    const firebaseError = error as FirebaseAuthError;
    throw new AuthError(getErrorMessage(firebaseError), firebaseError.code);
  }
};

export const sair = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new AuthError('Erro ao sair do sistema. Tente novamente.');
  }
};