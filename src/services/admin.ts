import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: Date;
}

export const createAdminUser = async (
  uid: string,
  name: string,
  email: string
): Promise<void> => {
  const adminData: AdminUser = {
    uid,
    name,
    email,
    role: 'admin',
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'admins', uid), adminData);
};