// MODO DEMO - Usando servicio mock
import { productService as mockProductService } from './mockProductService';
export const productService = mockProductService;

// CÓDIGO ORIGINAL DE FIREBASE (comentado para modo demo)
/*
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

export const productService = {
  // Crear producto
  async createProduct(productData) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      throw new Error('Error al crear producto: ' + error.message);
    }
  },

  // Obtener todos los productos
  async getProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener productos: ' + error.message);
    }
  },

  // Obtener productos activos
  async getActiveProducts() {
    try {
      const q = query(
        collection(db, 'products'), 
        where('active', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener productos activos: ' + error.message);
    }
  },

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (error) {
      throw new Error('Error al obtener producto: ' + error.message);
    }
  },

  // Actualizar producto
  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: new Date()
      });
    } catch (error) {
      throw new Error('Error al actualizar producto: ' + error.message);
    }
  },

  // Eliminar producto (soft delete)
  async deleteProduct(id) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        active: false,
        updatedAt: new Date()
      });
    } catch (error) {
      throw new Error('Error al eliminar producto: ' + error.message);
    }
  },

  // Buscar productos por nombre
  async searchProducts(searchTerm) {
    try {
      const products = await this.getActiveProducts();
      return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      throw new Error('Error al buscar productos: ' + error.message);
    }
  },

  // Obtener productos por categoría
  async getProductsByCategory(category) {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('active', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener productos por categoría: ' + error.message);
    }
  },

  // Obtener productos con bajo stock
  async getLowStockProducts(threshold = 10) {
    try {
      const products = await this.getActiveProducts();
      return products.filter(product => product.stock <= threshold);
    } catch (error) {
      throw new Error('Error al obtener productos con bajo stock: ' + error.message);
    }
  }
};
*/