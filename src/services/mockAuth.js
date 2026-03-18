// Sistema de autenticación mock para demostración
const MOCK_USERS = [
  {
    uid: 'admin-001',
    email: 'admin@postrecitos.com',
    name: 'Administrador',
    role: 'admin',
    active: true
  },
  {
    uid: 'emp-001',
    email: 'empleado@postrecitos.com',
    name: 'Empleado',
    role: 'empleado',
    active: true
  }
];

const MOCK_PASSWORD = '123456';

class MockAuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  async login(email, password) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password !== MOCK_PASSWORD) {
      throw new Error('Contraseña incorrecta');
    }

    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    this.currentUser = user;
    localStorage.setItem('mockUser', JSON.stringify(user));
    
    // Notificar a los listeners
    this.listeners.forEach(callback => callback(user));
    
    return user;
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.currentUser = null;
    localStorage.removeItem('mockUser');
    this.listeners.forEach(callback => callback(null));
  }

  onAuthStateChange(callback) {
    this.listeners.push(callback);
    
    // Verificar si hay usuario guardado
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser = user;
        callback(user);
      } catch (error) {
        callback(null);
      }
    } else {
      callback(null);
    }

    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export const mockAuthService = new MockAuthService();

export const authService = {
  async login(email, password) {
    return mockAuthService.login(email, password);
  },

  async logout() {
    return mockAuthService.logout();
  },

  onAuthStateChange(callback) {
    return mockAuthService.onAuthStateChange(callback);
  },

  async createUser(email, password, userData) {
    throw new Error('Crear usuarios no está disponible en modo demo');
  },

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