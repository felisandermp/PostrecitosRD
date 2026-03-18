import { mockDB } from './mockData';
import { productService } from './productService';

// ============ INVENTORY SERVICE ============
export const inventoryService = {
  async recordMovement(productId, type, quantity, userId, reason = '') {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const movement = {
      id: mockDB.generateId(),
      productId,
      type,
      quantity,
      userId,
      reason,
      date: mockDB.createTimestamp(),
      createdAt: mockDB.createTimestamp()
    };
    
    mockDB.inventoryMovements.push(movement);
    mockDB.save();
  },

  async updateStock(productId, newStock, movementType, quantity, userId, reason = '') {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const product = mockDB.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    product.stock = newStock;
    product.updatedAt = new Date();

    const movement = {
      id: mockDB.generateId(),
      productId,
      type: movementType,
      quantity,
      userId,
      reason,
      date: mockDB.createTimestamp(),
      createdAt: mockDB.createTimestamp()
    };
    
    mockDB.inventoryMovements.push(movement);
    mockDB.save();
  },

  async decreaseStock(productId, quantity, userId, orderId) {
    const product = mockDB.products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    
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
  },

  async increaseStock(productId, quantity, userId, reason = 'Reposición') {
    const product = mockDB.products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    
    const newStock = product.stock + quantity;
    await this.updateStock(
      productId, 
      newStock, 
      'entrada', 
      quantity, 
      userId, 
      reason
    );
  },

  async getMovements(productId = null, limit = 50) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let movements = [...mockDB.inventoryMovements];
    
    if (productId) {
      movements = movements.filter(m => m.productId === productId);
    }
    
    movements.sort((a, b) => b.date.seconds - a.date.seconds);
    
    const movementsWithProducts = movements.map(movement => {
      const product = mockDB.products.find(p => p.id === movement.productId);
      return {
        ...movement,
        productName: product ? product.name : 'Producto no encontrado'
      };
    });

    return movementsWithProducts.slice(0, limit);
  },

  async getInventorySummary() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const products = mockDB.products.filter(p => p.active);
    
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => 
      sum + (product.stock * product.cost), 0
    );
    const lowStockProducts = products.filter(product => product.stock <= 10 && product.stock > 0);
    const outOfStockProducts = products.filter(product => product.stock === 0);

    return {
      totalProducts,
      totalValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts
    };
  }
};

// ============ ORDER SERVICE ============
export const orderService = {
  async createOrder(orderData, userId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar stock disponible
    for (const item of orderData.products) {
      const product = mockDB.products.find(p => p.id === item.productId);
      
      if (!product) {
        throw new Error(`Producto ${item.name} no encontrado`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${item.name}. Stock disponible: ${product.stock}`);
      }
    }

    // Crear el pedido
    const orderId = mockDB.generateId();
    const order = {
      id: orderId,
      ...orderData,
      userId,
      status: 'completado',
      createdAt: mockDB.createTimestamp(),
      updatedAt: mockDB.createTimestamp()
    };

    mockDB.orders.push(order);

    // Descontar stock de cada producto
    for (const item of orderData.products) {
      const product = mockDB.products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
      product.updatedAt = new Date();

      // Registrar movimiento
      mockDB.inventoryMovements.push({
        id: mockDB.generateId(),
        productId: item.productId,
        type: 'salida',
        quantity: item.quantity,
        userId,
        reason: `Venta - Pedido: ${orderId}`,
        date: mockDB.createTimestamp(),
        createdAt: mockDB.createTimestamp()
      });
    }

    mockDB.save();
    
    // También guardar en localStorage con las claves alternativas para compatibilidad
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (!localOrders.find(o => o.id === order.id)) {
      localOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(localOrders));
    }

    // Generar factura
    await invoiceService.createInvoice(order);

    return order;
  },

  async getOrders(limit = 50) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Combinar pedidos de mockDB y localStorage
    const mockOrders = [...mockDB.orders];
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Convertir fechas de localStorage al formato esperado
    const formattedLocalOrders = localOrders.map(order => ({
      ...order,
      createdAt: order.createdAt?.seconds 
        ? order.createdAt 
        : mockDB.createTimestamp(new Date(order.date))
    }));
    
    // Combinar y eliminar duplicados por ID
    const allOrders = [...mockOrders, ...formattedLocalOrders];
    const uniqueOrders = allOrders.filter((order, index, self) =>
      index === self.findIndex(o => o.id === order.id)
    );
    
    return uniqueOrders
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      .slice(0, limit);
  },

  async getOrderById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const order = mockDB.orders.find(o => o.id === id);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }
    return { ...order };
  },

  async getOrdersByDate(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    
    // Combinar pedidos de mockDB y localStorage
    const mockOrders = [...mockDB.orders];
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Convertir fechas de localStorage al formato esperado
    const formattedLocalOrders = localOrders.map(order => ({
      ...order,
      createdAt: order.createdAt?.seconds 
        ? order.createdAt 
        : mockDB.createTimestamp(new Date(order.date))
    }));
    
    // Combinar y eliminar duplicados
    const allOrders = [...mockOrders, ...formattedLocalOrders];
    const uniqueOrders = allOrders.filter((order, index, self) =>
      index === self.findIndex(o => o.id === order.id)
    );
    
    return uniqueOrders
      .filter(order => 
        order.createdAt.seconds >= start && 
        order.createdAt.seconds <= end
      )
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  },

  async getTodayOrders() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return await this.getOrdersByDate(startOfDay, endOfDay);
  },

  async getSalesStats(startDate = null, endDate = null) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
  }
};

// ============ INVOICE SERVICE ============
export const invoiceService = {
  async createInvoice(orderData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const invoiceNumber = await this.generateInvoiceNumber();
    
    const invoice = {
      id: mockDB.generateId(),
      invoiceNumber,
      orderId: orderData.id,
      customer: orderData.customer || null,
      date: mockDB.createTimestamp(),
      products: orderData.products,
      subtotal: orderData.subtotal,
      tax: orderData.tax || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      userId: orderData.userId,
      createdAt: mockDB.createTimestamp()
    };

    mockDB.invoices.push(invoice);
    mockDB.save();
    
    return invoice;
  },

  async generateInvoiceNumber() {
    const number = mockDB.invoiceCounter.toString().padStart(6, '0');
    mockDB.invoiceCounter++;
    mockDB.save();
    return `FAC-${number}`;
  },

  async getInvoices(limit = 50) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Combinar facturas de mockDB y localStorage
    const mockInvoices = [...mockDB.invoices];
    const localInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // Convertir fechas de localStorage al formato esperado
    const formattedLocalInvoices = localInvoices.map(invoice => ({
      ...invoice,
      date: invoice.date?.seconds 
        ? invoice.date 
        : mockDB.createTimestamp(new Date(invoice.date)),
      createdAt: invoice.createdAt?.seconds 
        ? invoice.createdAt 
        : mockDB.createTimestamp(new Date(invoice.date))
    }));
    
    // Combinar y eliminar duplicados por ID
    const allInvoices = [...mockInvoices, ...formattedLocalInvoices];
    const uniqueInvoices = allInvoices.filter((invoice, index, self) =>
      index === self.findIndex(i => i.id === invoice.id)
    );
    
    return uniqueInvoices
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
      .slice(0, limit);
  },

  async getInvoiceById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const invoice = mockDB.invoices.find(i => i.id === id);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }
    return { ...invoice };
  },

  generateInvoicePDF(invoice) {
    // Importar jsPDF dinámicamente
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text('FACTURA', 105, 20, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text('Postrecitos de Mamá', 20, 40);
    doc.text('Dirección: Calle Principal #123', 20, 50);
    doc.text('Teléfono: (809) 753-5382', 20, 60);
    doc.text('Email: info@postrecitos.com', 20, 70);
    
    // Información de la factura
    doc.text(`Factura No: ${invoice.invoiceNumber}`, 120, 40);
    doc.text(`Fecha: ${new Date(invoice.date.seconds * 1000).toLocaleDateString()}`, 120, 50);
    doc.text(`Método de Pago: ${invoice.paymentMethod}`, 120, 60);
    
    // Cliente (si existe)
    if (invoice.customer) {
      doc.text(`Cliente: ${invoice.customer.name || 'Cliente General'}`, 120, 70);
    }
    
    // Tabla de productos
    const tableData = invoice.products.map(item => [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${item.subtotal.toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 90,
      head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 120, finalY);
    
    if (invoice.tax > 0) {
      doc.text(`Impuestos: $${invoice.tax.toFixed(2)}`, 120, finalY + 10);
      doc.text(`Total: $${invoice.total.toFixed(2)}`, 120, finalY + 20);
    } else {
      doc.text(`Total: $${invoice.total.toFixed(2)}`, 120, finalY + 10);
    }
    
    // Pie de página
    doc.setFontSize(10);
    doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
    
    return doc;
  },

  downloadInvoicePDF(invoice) {
    const doc = this.generateInvoicePDF(invoice);
    doc.save(`Factura-${invoice.invoiceNumber}.pdf`);
  },

  async getInvoicesByDate(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    
    return mockDB.invoices
      .filter(invoice => 
        invoice.date.seconds >= start && 
        invoice.date.seconds <= end
      )
      .sort((a, b) => b.date.seconds - a.date.seconds);
  }
};