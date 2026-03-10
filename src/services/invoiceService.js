import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const invoiceService = {
  // Crear factura
  async createInvoice(orderData) {
    try {
      // Generar número de factura
      const invoiceNumber = await this.generateInvoiceNumber();
      
      const invoice = {
        invoiceNumber,
        orderId: orderData.id,
        customer: orderData.customer || null,
        date: new Date(),
        products: orderData.products,
        subtotal: orderData.subtotal,
        tax: orderData.tax || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        userId: orderData.userId,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'invoices'), invoice);
      return {
        id: docRef.id,
        ...invoice
      };
    } catch (error) {
      throw new Error('Error al crear factura: ' + error.message);
    }
  },

  // Generar número de factura secuencial
  async generateInvoiceNumber() {
    try {
      const q = query(collection(db, 'invoices'), orderBy('invoiceNumber', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 'FAC-000001';
      }
      
      const lastInvoice = querySnapshot.docs[0].data();
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      const newNumber = (lastNumber + 1).toString().padStart(6, '0');
      
      return `FAC-${newNumber}`;
    } catch (error) {
      return `FAC-${Date.now().toString().slice(-6)}`;
    }
  },

  // Obtener todas las facturas
  async getInvoices(limit = 50) {
    try {
      const q = query(
        collection(db, 'invoices'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, limit);
    } catch (error) {
      throw new Error('Error al obtener facturas: ' + error.message);
    }
  },

  // Obtener factura por ID
  async getInvoiceById(id) {
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Factura no encontrada');
      }
    } catch (error) {
      throw new Error('Error al obtener factura: ' + error.message);
    }
  },

  // Generar PDF de factura
  generateInvoicePDF(invoice) {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text('FACTURA', 105, 20, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(12);
    doc.text('Repostería Dulce Hogar', 20, 40);
    doc.text('Dirección: Calle Principal #123', 20, 50);
    doc.text('Teléfono: (555) 123-4567', 20, 60);
    doc.text('Email: info@dulcehogar.com', 20, 70);
    
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

  // Descargar factura en PDF
  downloadInvoicePDF(invoice) {
    const doc = this.generateInvoicePDF(invoice);
    doc.save(`Factura-${invoice.invoiceNumber}.pdf`);
  },

  // Obtener facturas por fecha
  async getInvoicesByDate(startDate, endDate) {
    try {
      const q = query(
        collection(db, 'invoices'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error al obtener facturas por fecha: ' + error.message);
    }
  }
};