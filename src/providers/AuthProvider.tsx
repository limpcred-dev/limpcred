import React, { useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthContext, AuthContextType, AuthUser } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if admin
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            setUser({ ...firebaseUser, tipo: 'admin' } as AuthUser);
            return;
          }

          // Check if regular user
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ 
              ...firebaseUser, 
              tipo: 'user',
              empresaId: userData.empresaId 
            } as AuthUser);
            return;
          }
        } catch (error) {
          console.error('Error checking user type:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Validate credentials
      if (!email || !password) throw new Error('Email e senha são obrigatórios');
      
      // Attempt login
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check user type
      const adminDoc = await getDoc(doc(db, 'admins', result.user.uid));
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (adminDoc.exists()) {
        // Admin users always go to company selection
        setUser({ ...result.user, tipo: 'admin' } as AuthUser);
        navigate('/selecionar-empresa');
      } else if (userDoc.exists()) { 
        const userData = userDoc.data();
        const userType = userData.tipo === 'vendedor' ? 'vendedor' : 'user';
        const userWithEmpresa = {
          ...result.user,
          tipo: userType,
          empresaId: userData.empresaId
        } as AuthUser;
        
        setUser(userWithEmpresa);
        
        // Check if user has empresa
        if (!userData.empresaId) {
          navigate('/selecionar-empresa');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Usuário não encontrado no sistema');
      }
      
      return result.user;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        throw new Error('Email ou senha incorretos');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      if (!email || !password || !name) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Update profile with name
      await updateProfile(user, { displayName: name });

      // Create admin document with retry logic
      // Create admin document
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        role: 'admin',
        createdAt: serverTimestamp()
      }, {
        merge: true // Use merge to prevent overwriting existing data
      });

      setUser({ 
        ...user, 
        tipo: 'admin' 
      } as AuthUser);

      navigate('/selecionar-empresa');
      return user;
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Always create/check admin document for Google login
      const adminRef = doc(db, 'admins', result.user.uid);
      const adminDoc = await getDoc(adminRef);
      
      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          role: 'admin',
          createdAt: serverTimestamp()
        });
      }

      // Always redirect to company selection for Google login
      navigate('/selecionar-empresa');
      return result.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}