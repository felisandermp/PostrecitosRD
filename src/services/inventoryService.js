import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query,
  where,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { productService } from './productService';

export const inventoryService = {
  // Registrar movimiento de inventario
  async recordMovement(productId, type, quantity, userId, reason = '') {
    try {
      await addDoc(collection(db, 'inventory_movements'), {
        productId,
        type, // 'entrada' o 'salida'
        quantity,
        userId,
        reason,
        date: new Date(),
        createdAt: new Date()
      });
    } catch (error) {
      throw new Error('Error al registrar movimiento: ' + error.message);
    }
  },

  // Actualizar stock de producto con transacción
  async updateStock(productId, newStock, movementType, quantity, userId, reason = '') {
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', productId);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error('Producto no encontrado');
        }

        // Actualizar stock del producto
        transaction.update(productRef, {
          stock: newStock,
          updatedAt: new Date()
        });

        // Registrar movimiento
        const movementRef = doc(collection(db, 'inventory_movements'));
        transaction.set(movementRef, {
          productId,
          type: movementType,
          quantity,
          userId,
          reason,
          date: new Date(),
          createdAt: new Date()
        });
      });
    } catch (error) {
      throw new Error('Error al actualizar stock: ' + error.message);
    }
  },

  // Descontar stock (para ventas)
  async decreaseStock(productId, quantity, userId, orderId) {
    try {
      const product = await productService.getProductById(productId);
      
      if (product.stock < quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Stock actual: ${product.stock}`);
      }

      const newStock = product.stock - quantity;
      await this.updateStock(
        productId, 
        newStock, 
        'salida', 
        quantity, 
        userId, 
        `Venta - Pedido: ${orderId}`
      );
    } catch (error) {
      throw error;
    }
  },

  // Aumentar stock (para devoluciones o reposición)
  async increaseStock(productId, quantity, userId, reason = 'Reposición') {
    try {
      const product = await productService.getProductById(productId);
      const newStock = product.stock + quantity;
      
      await this.updateStock(
        productId, 
        newStock, 
        'entrada', 
        quantity, 
        userId, 
        reason
      );
    } catch (error) {
      throw error;
    }
  },

  // Obtener historial de movimientos
  async getMovements(productId = null, limit = 50) {
    try {
      let q;
      
      if (productId) {
        q = query(
          collection(db, 'inventory_movements'),
          where('productId', '==', productId),
          orderBy('date', 'desc')
        );
      } else {
        q = query(
          collection(db, 'inventory_movements'),
          orderBy('date', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const movements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener información de productos para cada movimiento
      const movementsWithProducts = await Promise.all(
        movements.map(async (movement) => {
          try {
            const product = await productService.getProductById(movement.productId);
            return {
              ...movement,
              productName: product.name
            };
          } catch (error) {
            return {
              ...movement,
              productName: 'Producto no encontrado'
            };
          }
        })
      );

      return movementsWithProducts.slice(0, limit);
    } catch (error) {
      throw new Error('Error al obtener movimientos: ' + error.message);
    }
  },

  // Obtener resumen de inventario
  async getInventorySummary() {
    try {
      const products = await productService.getActiveProducts();
      
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => 
        sum + (product.stock * product.cost), 0
      );
      const lowStockProducts = products.filter(product => product.stock <= 10);
      const outOfStockProducts = products.filter(product => product.stock === 0);

      return {
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockProducts,
        outOfStockProducts
      };
    } catch (error) {
      throw new Error('Error al obtener resumen de inventario: ' + error.message);
    }
  }
};