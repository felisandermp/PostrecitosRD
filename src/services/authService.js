// MODO DEMO - Usando autenticación mock
// Para usar Firebase real, descomenta las importaciones de abajo y comenta la línea de mockAuth

// import { 
//   signInWithEmailAndPassword, 
//   signOut, 
//   onAuthStateChanged,
//   createUserWithEmailAndPassword 
// } from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { auth, db } from './firebase';

// Importar servicio mock para demostración
import { authService as mockAuthService } from './mockAuth';

// Exportar el servicio mock
export const authService = mockAuthService;

// CÓDIGO ORIGINAL DE FIREBASE (comentado para modo demo)
/*
export const authService = {
  // Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener datos adicionales del usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Error al cerrar sesión');
    }
  },

  // Crear usuario (solo admin)
  async createUser(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: userData.role || 'empleado',
        name: userData.name,
        createdAt: new Date(),
        active: true
      });
      
      return user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error.code));
    }
  },

  // Observador de estado de autenticación
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        callback({
          uid: user.uid,
          email: user.email,
          ...userData
        });
      } else {
        callback(null);
      }
    });
  },

  // Mensajes de error en español
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde'
    };
    return errorMessages[errorCode] || 'Error de autenticación';
  }
};
*/