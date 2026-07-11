import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type UserRole = 'landlord' | 'tenant';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedDemo = localStorage.getItem('tentrust_demo_user');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsLoading(false);
      } catch (e) {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      } else {
        if (!localStorage.getItem('tentrust_demo_user')) {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (role: UserRole) => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const nameParts = (firebaseUser.displayName || 'Unknown User').split(' ');
        const newUser = {
          email: firebaseUser.email || '',
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          role,
          verified: firebaseUser.emailVerified || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await setDoc(userRef, newUser);
        setUser({ id: firebaseUser.uid, ...newUser } as User);
      } else {
        const existingData = docSnap.data();
        setUser({ id: firebaseUser.uid, ...existingData } as User);
      }
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    const demoId = role === 'landlord' ? 'demo-landlord-123' : 'demo-tenant-123';
    const demoUser = {
      email: role === 'landlord' ? 'landlord@tentrust.ng' : 'tenant@tentrust.ng',
      firstName: role === 'landlord' ? 'Oluwaseun' : 'Chukwudi',
      lastName: role === 'landlord' ? 'Adebayo' : 'Okafor',
      role,
      verified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const userData = { id: demoId, ...demoUser } as User;
    setUser(userData);
    localStorage.setItem('tentrust_demo_user', JSON.stringify(userData));

    try {
      setDoc(doc(db, 'users', demoId), demoUser, { merge: true }).catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  const logout = async () => {
    localStorage.removeItem('tentrust_demo_user');
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginAsDemo, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
