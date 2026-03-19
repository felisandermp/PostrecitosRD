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

  async generateInvoicePDF(invoice) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colores de marca
    const brown = [139, 69, 19];
    const darkBrown = [101, 50, 14];
    const cream = [255, 248, 240];
    const lightBrown = [210, 105, 30];
    const white = [255, 255, 255];

    // Header bar marron
    doc.setFillColor(...brown);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo en alta resolucion - fondo marron para fusionar con header
    try {
      const logoData = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.max(img.naturalWidth, img.naturalHeight, 400);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          // Pintar fondo con el mismo marron del header para que se funda
          ctx.fillStyle = 'rgb(139, 69, 19)';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = '/logo.png';
      });
      doc.addImage(logoData, 'PNG', 10, 2, 36, 36);
    } catch (e) {
      // Continuar sin logo si falla
    }

    // Nombre empresa en header
    doc.setTextColor(...white);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Postrecitos de Mama', 50, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Reposteria Artesanal', 50, 26);
    doc.text('Tel: (809) 753-5382  |  info@postrecitos.com', 50, 33);

    // Titulo FACTURA
    doc.setTextColor(...darkBrown);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', pageWidth - 15, 58, { align: 'right' });

    // Info factura (derecha)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const invoiceDate = new Date(invoice.date.seconds * 1000);
    const dateStr = invoiceDate.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text('No: ' + invoice.invoiceNumber, pageWidth - 15, 66, { align: 'right' });
    doc.text('Fecha: ' + dateStr, pageWidth - 15, 73, { align: 'right' });
    doc.text('Pago: ' + invoice.paymentMethod, pageWidth - 15, 80, { align: 'right' });

    // Seccion cliente (fondo crema)
    doc.setFillColor(...cream);
    doc.roundedRect(14, 90, pageWidth - 28, 22, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkBrown);
    doc.text('Cliente:', 20, 100);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const customerName = invoice.customer?.name || 'Cliente General';
    const customerPhone = invoice.customer?.phone ? ('  |  Tel: ' + invoice.customer.phone) : '';
    doc.text(customerName + customerPhone, 48, 100);
    if (invoice.customer?.email) {
      doc.text('Email: ' + invoice.customer.email, 20, 108);
    }

    // Linea decorativa
    doc.setDrawColor(...lightBrown);
    doc.setLineWidth(0.8);
    doc.line(14, 118, pageWidth - 14, 118);

    // Tabla de productos
    const tableData = invoice.products.map(item => [
      item.name,
      item.quantity.toString(),
      'RD$ ' + item.price.toFixed(2),
      'RD$ ' + item.subtotal.toFixed(2)
    ]);

    doc.autoTable({
      startY: 124,
      head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: brown,
        textColor: white,
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [255, 245, 235]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 75 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 14, right: 14 },
      styles: {
        cellPadding: 5,
        lineColor: [220, 200, 180],
        lineWidth: 0.3
      }
    });

    // Totales (caja crema a la derecha)
    const finalY = doc.lastAutoTable.finalY + 8;
    const totalsX = pageWidth - 14 - 80;
    const totalsH = invoice.tax > 0 ? 42 : 30;

    doc.setFillColor(...cream);
    doc.roundedRect(totalsX, finalY, 80, totalsH, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX + 5, finalY + 10);
    doc.text('RD$ ' + invoice.subtotal.toFixed(2), totalsX + 75, finalY + 10, { align: 'right' });

    if (invoice.tax > 0) {
      doc.text('ITBIS:', totalsX + 5, finalY + 20);
      doc.text('RD$ ' + invoice.tax.toFixed(2), totalsX + 75, finalY + 20, { align: 'right' });

      doc.setDrawColor(...lightBrown);
      doc.setLineWidth(0.5);
      doc.line(totalsX + 5, finalY + 25, totalsX + 75, finalY + 25);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkBrown);
      doc.text('Total:', totalsX + 5, finalY + 35);
      doc.text('RD$ ' + invoice.total.toFixed(2), totalsX + 75, finalY + 35, { align: 'right' });
    } else {
      doc.setDrawColor(...lightBrown);
      doc.setLineWidth(0.5);
      doc.line(totalsX + 5, finalY + 14, totalsX + 75, finalY + 14);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkBrown);
      doc.text('Total:', totalsX + 5, finalY + 24);
      doc.text('RD$ ' + invoice.total.toFixed(2), totalsX + 75, finalY + 24, { align: 'right' });
    }

    // Footer
    const footerY = 272;
    doc.setDrawColor(...lightBrown);
    doc.setLineWidth(0.5);
    doc.line(14, footerY, pageWidth - 14, footerY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 120, 90);
    doc.text('Gracias por preferirnos! Endulzamos tus momentos especiales.', pageWidth / 2, footerY + 8, { align: 'center' });
    doc.text('Postrecitos de Mama  |  www.postrecitos.com  |  (809) 753-5382', pageWidth / 2, footerY + 15, { align: 'center' });

    return doc;
  },

  async downloadInvoicePDF(invoice) {
    const doc = await this.generateInvoicePDF(invoice);
    doc.save('Factura-' + invoice.invoiceNumber + '.pdf');
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
