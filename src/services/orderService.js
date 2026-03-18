// MODO DEMO - Usando servicio mock
import { orderService as mockOrderService } from './mockServices';
export const orderService = mockOrderService;

// CÓDIGO ORIGINAL DE FIREBASE (comentado para modo demo)
/*
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { inventoryService } from './inventoryService';
import { invoiceService } from './invoiceService';

export const orderService = {
  // Crear pedido/venta
  async createOrder(orderData, userId) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        // Verificar stock disponible para todos los productos
        for (const item of orderData.products) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            throw new Error(`Producto ${item.name} no encontrado`);
          }
          
          const product = productDoc.data();
          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.name}. Stock disponible: ${product.stock}`);
          }
        }

        // Crear el pedido
        const orderRef = doc(collection(db, 'orders'));
        const orderId = orderRef.id;
        
        const order = {
          id: orderId,
          ...orderData,
          userId,
          status: 'completado',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        transaction.set(orderRef, order);

        // Descontar stock de cada producto
        for (const item of orderData.products) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          const currentStock = productDoc.data().stock;
          const newStock = currentStock - item.quantity;

          transaction.update(productRef, {
            stock: newStock,
            updatedAt: new Date()
          });

          // Registrar movimiento de inventario
          const movementRef = doc(collection(db, 'inventory_movements'));
          transaction.set(movementRef, {
            productId: item.productId,
            type: 'salida',
            quantity: item.quantity,
            userId,
            reason: `Venta - Pedido: ${orderId}`,
            date: new Date(),
            createdAt: new Date()
          });
        }

        return order;
      });

      // Generar factura
      await invoiceService.createInvoice(result);

      return result;
    } catch (error) {
      throw new Error('Error al crear pedido: ' + error.message);
    }
  },

  // Obtener pedidos
  async getOrders(limit = 50) {
    try {
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, limit);
    } catch (error) {
      throw new Error('Error al obtener pedidos: ' + error.message);
    }
  },

  // Obtener pedido por ID
  async getOrderById(id) {
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Pedido no encontrado');
      }
    } catch (error) {
      throw new Error('Error al obtener pedido: ' + error.message);
    }
  },

  // Obtener pedidos por fecha
  async getOrdersByDate(startDate, endDate) {
    try {
      const start = Timestamp.fromDate(startDate);
      const end = Timestamp.fromDate(endDate);
      
      const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener pedidos por fecha: ' + error.message);
    }
  },

  // Obtener pedidos del día
  async getTodayOrders() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      return await this.getOrdersByDate(startOfDay, endOfDay);
    } catch (error) {
      throw new Error('Error al obtener pedidos del día: ' + error.message);
    }
  },

  // Obtener estadísticas de ventas
  async getSalesStats(startDate = null, endDate = null) {
    try {
      let orders;
      
      if (startDate && endDate) {
        orders = await this.getOrdersByDate(startDate, endDate);
      } else {
        orders = await this.getTodayOrders();
      }

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Productos más vendidos
      const productSales = {};
      orders.forEach(order => {
        order.products.forEach(item => {
          if (productSales[item.productId]) {
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.subtotal;
          } else {
            productSales[item.productId] = {
              name: item.name,
              quantity: item.quantity,
              revenue: item.subtotal
            };
          }
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        topProducts
      };
    } catch (error) {
      throw new Error('Error al obtener estadísticas: ' + error.message);
    }
  }
};
*/