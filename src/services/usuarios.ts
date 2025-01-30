import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { Usuario, UsuarioCreate } from '../types/usuario';
import { permissoesPadrao } from '../config/permissoes';

interface UserData {
  id: string;
  nome: string;
  email: string;
  documento: string;
  whatsapp: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  tipo: string;
  empresaId: string;
  adminId: string;
  status: 'ativo' | 'inativo';
  dataCriacao: any;
  permissoes: any[];
}
export const usuariosService = {
  async criar(dados: UsuarioCreate, adminId: string): Promise<Usuario> {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      dados.email,
      dados.senha
    );

    // Preparar dados do usuário
    const userData: UserData = {
      id: userCredential.user.uid,
      nome: dados.nome,
      documento: dados.documento,
      whatsapp: dados.whatsapp,
      endereco: dados.endereco,
      email: dados.email,
      tipo: dados.tipo,
      empresaId: dados.empresaId,
      adminId,
      status: dados.status,
      dataCriacao: serverTimestamp(),
      permissoes: permissoesPadrao[dados.tipo],
    };

    if (dados.foto) {
      userData.foto = dados.foto;
    }

    // Criar documento na coleção users
    await setDoc(doc(db, 'users', userData.id), userData);

    return userData as Usuario;
  },

  async listarPorEmpresa(empresaId: string): Promise<Usuario[]> {
    const q = query(
      collection(db, 'users'),
      where('empresaId', '==', empresaId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dataCriacao: data.dataCriacao?.toDate() || new Date()
      } as Usuario;
    });
  },

  async listarPorEmpresaETipo(empresaId: string, tipo: string): Promise<Usuario[]> {
    const q = query(
      collection(db, 'users'),
      where('empresaId', '==', empresaId),
      where('tipo', '==', tipo)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Usuario[];
  },

  async buscarPorId(id: string): Promise<Usuario | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as Usuario;
  },

  async atualizar(id: string, dados: Partial<Usuario>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, dados);
  },

  async excluir(id: string): Promise<void> {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  },

  async resetarSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
};