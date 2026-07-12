import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { getMiPerfil } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [perfil, setPerfil] = useState(null); // datos de Firestore: nombre, rol, etc.
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const data = await getMiPerfil();
          setPerfil(data);
        } catch (err) {
          console.error('No se pudo cargar el perfil:', err);
          setPerfil(null);
        }
      } else {
        setPerfil(null);
      }
      setCargando(false);
    });
    return unsub;
  }, []);

  async function login(email, password) {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      const mensajes = {
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/user-disabled': 'Tu cuenta está desactivada.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
      };
      setError(mensajes[err.code] || 'Error al iniciar sesión.');
      return false;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  const value = {
    firebaseUser,
    perfil,
    rol: perfil?.rol || null,
    cargando,
    error,
    login,
    logout,
    autenticado: !!firebaseUser && !!perfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
