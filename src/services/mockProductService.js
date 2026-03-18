import { mockDB } from './mockData';

export const productService = {
  // Crear producto
  async createProduct(productData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newProduct = {
      id: mockDB.generateId(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockDB.products.push(newProduct);
    mockDB.save();
    return newProduct.id;
  },

  // Obtener todos los productos
  async getProducts() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockDB.products].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Obtener productos activos
  async getActiveProducts() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDB.products
      .filter(p => p.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // Obtener producto por ID
  async getProductById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const product = mockDB.products.find(p => p.id === id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return { ...product };
  },

  // Actualizar producto
  async updateProduct(id, productData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDB.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }
    
    mockDB.products[index] = {
      ...mockDB.products[index],
      ...productData,
      updatedAt: new Date()
    };
    mockDB.save();
  },

  // Eliminar producto (soft delete)
  async deleteProduct(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDB.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }
    
    mockDB.products[index].active = false;
    mockDB.products[index].updatedAt = new Date();
    mockDB.save();
  },

  // Buscar productos por nombre
  async searchProducts(searchTerm) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const term = searchTerm.toLowerCase();
    return mockDB.products.filter(product => 
      product.active &&
      (product.name.toLowerCase().includes(term) ||
       product.description.toLowerCase().includes(term))
    );
  },

  // Obtener productos por categoría
  async getProductsByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDB.products
      .filter(p => p.category === category && p.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // Obtener productos con bajo stock
  async getLowStockProducts(threshold = 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDB.products.filter(product => 
      product.active && product.stock <= threshold
    );
  }
};