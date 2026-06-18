import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
  loginWithEmail: (email: string, password: string, role: UserRole) => Promise<void>;
  signupWithEmail: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            // Document might simply be in the process of being created by Google login or Email signup
            // We do nothing here, letting the auth functions handle setting the user state.
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // 30 minutes of inactivity
    const INACTIVITY_LIMIT = 30 * 60 * 1000;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      if (auth.currentUser) {
        timeoutId = setTimeout(() => {
          logout();
          console.info('User logged out due to inactivity.');
        }, INACTIVITY_LIMIT);
      }
    };

    if (user) {
      window.addEventListener('mousemove', resetTimeout);
      window.addEventListener('keydown', resetTimeout);
      window.addEventListener('click', resetTimeout);
      window.addEventListener('scroll', resetTimeout);
      resetTimeout();
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
      window.removeEventListener('click', resetTimeout);
      window.removeEventListener('scroll', resetTimeout);
    };
  }, [user]);

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
        await updateDoc(userRef, { role, updatedAt: Date.now() });
        setUser({ id: firebaseUser.uid, ...existingData, role } as User);
      }
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };

  const loginWithEmail = async (email: string, password: string, role: UserRole) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        await updateDoc(userRef, { role, updatedAt: Date.now() });
        setUser({ id: firebaseUser.uid, ...docSnap.data(), role } as User);
      } else {
        // Document missing entirely after login. Create a fallback to rescue the account.
        const nameParts = (firebaseUser.displayName || 'Unknown User').split(' ');
        const fallbackUser = {
          email: firebaseUser.email || '',
          firstName: nameParts[0] || 'Unknown',
          lastName: nameParts.slice(1).join(' ') || 'User',
          role: 'tenant', // Default to tenant if completely lost
          verified: firebaseUser.emailVerified || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await setDoc(userRef, fallbackUser);
        setUser({ id: firebaseUser.uid, ...fallbackUser } as User);
      }
    } catch (error) {
       console.error("Login failed:", error);
       throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, firstName: string, lastName: string, role: UserRole) => {
    let firebaseUser;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
      await sendEmailVerification(firebaseUser, {
        url: window.location.origin + '/auth?mode=login',
        handleCodeInApp: true
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          firebaseUser = result.user;
          if (!firebaseUser.emailVerified) {
            await sendEmailVerification(firebaseUser, {
              url: window.location.origin + '/auth?mode=login',
              handleCodeInApp: true
            });
          }
          // Document repair happens below
        } catch (loginError: any) {
             throw new Error('Account exists but incorrect password. Please sign in instead.');
        }
      } else {
        console.error("Signup failed:", error);
        throw error;
      }
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // Document already exists, log them in normally instead of repairing
        await updateDoc(userRef, { role, updatedAt: Date.now() });
        setUser({ id: firebaseUser.uid, ...docSnap.data(), role } as User);
        return;
      }

      const newUser = {
        email: firebaseUser.email || '',
        firstName,
        lastName,
        role,
        verified: firebaseUser.emailVerified || false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await setDoc(userRef, newUser);
      setUser({ id: firebaseUser.uid, ...newUser } as User);
    } catch (error) {
       console.error("Database setup failed:", error);
       throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithEmail, signupWithEmail, logout, isLoading }}>
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
