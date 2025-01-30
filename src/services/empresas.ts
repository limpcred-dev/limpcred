import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Empresa, EmpresaCreate } from '../types/empresa';

export const empresasService = {
  async criar(empresa: EmpresaCreate, adminId: string): Promise<Empresa> {
    const empresaRef = doc(collection(db, 'empresas'));
    const novaEmpresa: Empresa = {
      id: empresaRef.id,
      ...empresa,
      dataCadastro: new Date()
    };

    await setDoc(empresaRef, novaEmpresa);

    // Criar relação admin-empresa
    await setDoc(doc(db, 'admin_empresas', `${adminId}_${empresaRef.id}`), {
      adminId,
      empresaId: empresaRef.id,
      role: 'owner',
      dataCriacao: new Date()
    });

    return novaEmpresa;
  },

  async listarPorAdmin(adminId: string): Promise<Empresa[]> {
    const adminEmpresasQuery = query(
      collection(db, 'admin_empresas'),
      where('adminId', '==', adminId)
    );
    
    const adminEmpresas = await getDocs(adminEmpresasQuery);
    const empresas: Empresa[] = [];

    for (const adminEmpresa of adminEmpresas.docs) {
      const empresaDoc = await getDoc(doc(db, 'empresas', adminEmpresa.data().empresaId));
      if (empresaDoc.exists()) {
        empresas.push({ id: empresaDoc.id, ...empresaDoc.data() } as Empresa);
      }
    }

    return empresas;
  },

  async buscarPorId(id: string): Promise<Empresa | null> {
    const docRef = doc(db, 'empresas', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as Empresa;
  },

  async atualizar(id: string, dados: Partial<Empresa>): Promise<void> {
    const docRef = doc(db, 'empresas', id);
    await updateDoc(docRef, dados);
  }
};