// Base de datos mock en memoria
class MockDatabase {
  constructor() {
    this.products = this.initProducts();
    this.orders = [];
    this.invoices = [];
    this.inventoryMovements = [];
    this.invoiceCounter = 1;
  }

  initProducts() {
    return [
      // === PASTELES ===
      { id: 'prod-001', name: 'Pastel de Chocolate', description: 'Bizcocho de chocolate con ganache y decoracion artesanal', price: 25.99, cost: 15.00, stock: 15, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-002', name: 'Pastel de Vainilla', description: 'Bizcocho de vainilla con crema de mantequilla y frutas', price: 22.99, cost: 13.00, stock: 20, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-003', name: 'Pastel Red Velvet', description: 'Bizcocho red velvet con frosting de queso crema', price: 28.99, cost: 16.00, stock: 10, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-004', name: 'Pastel de Zanahoria', description: 'Bizcocho de zanahoria con nueces y frosting de queso crema', price: 24.99, cost: 14.00, stock: 12, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-005', name: 'Cheesecake de Fresa', description: 'Cheesecake cremoso con salsa de fresas frescas', price: 30.99, cost: 18.00, stock: 8, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-006', name: 'Cheesecake de Oreo', description: 'Cheesecake con base y trozos de galleta Oreo', price: 32.99, cost: 19.00, stock: 8, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      // === POSTRES ===
      { id: 'prod-007', name: 'Brownies', description: 'Brownies de chocolate intenso con nueces', price: 5.99, cost: 2.50, stock: 40, category: 'Postres', image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-008', name: 'Flan de Coco', description: 'Flan cremoso de coco con caramelo casero', price: 6.99, cost: 3.00, stock: 25, category: 'Postres', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-009', name: 'Tres Leches', description: 'Bizcocho empapado en tres leches con merengue', price: 7.99, cost: 3.50, stock: 20, category: 'Postres', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-010', name: 'Tiramisu', description: 'Tiramisu clasico con mascarpone y cafe', price: 8.99, cost: 4.50, stock: 15, category: 'Postres', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-011', name: 'Arroz con Leche', description: 'Arroz con leche cremoso con canela y pasas', price: 4.50, cost: 1.80, stock: 30, category: 'Postres', image: 'https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-012', name: 'Majarete', description: 'Postre dominicano de maiz con canela', price: 3.99, cost: 1.50, stock: 35, category: 'Postres', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-013', name: 'Habichuelas con Dulce', description: 'Postre tradicional dominicano de habichuelas', price: 5.50, cost: 2.50, stock: 20, category: 'Postres', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      // === CUPCAKES ===
      { id: 'prod-014', name: 'Cupcakes Red Velvet', description: 'Cupcakes de terciopelo rojo con frosting de queso crema', price: 3.50, cost: 1.50, stock: 50, category: 'Cupcakes', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-015', name: 'Cupcakes de Chocolate', description: 'Cupcakes de chocolate con buttercream', price: 3.50, cost: 1.50, stock: 50, category: 'Cupcakes', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-016', name: 'Cupcakes de Vainilla', description: 'Cupcakes de vainilla con frosting de colores', price: 3.00, cost: 1.20, stock: 50, category: 'Cupcakes', image: 'https://images.unsplash.com/photo-1486427944544-d2c246c4df14?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      // === GALLETAS ===
      { id: 'prod-017', name: 'Galletas de Avena', description: 'Galletas caseras de avena con pasas y canela', price: 8.99, cost: 4.00, stock: 60, category: 'Galletas', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-018', name: 'Galletas de Chocolate Chip', description: 'Galletas con chispas de chocolate belga', price: 9.99, cost: 4.50, stock: 60, category: 'Galletas', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-019', name: 'Alfajores', description: 'Galletas rellenas de dulce de leche con coco', price: 4.99, cost: 2.00, stock: 40, category: 'Galletas', image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      // === PANES ===
      { id: 'prod-020', name: 'Pan de Banana', description: 'Pan de banana con nueces y canela', price: 6.99, cost: 3.00, stock: 20, category: 'Panes', image: 'https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-021', name: 'Pan de Coco', description: 'Pan dulce de coco estilo dominicano', price: 4.99, cost: 2.00, stock: 25, category: 'Panes', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-022', name: 'Roles de Canela', description: 'Roles de canela con glaseado de azucar', price: 3.99, cost: 1.50, stock: 30, category: 'Panes', image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      // === DONAS ===
      { id: 'prod-023', name: 'Donas Glaseadas', description: 'Donas suaves con glaseado clasico', price: 2.50, cost: 1.00, stock: 40, category: 'Donas', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-024', name: 'Donas de Chocolate', description: 'Donas cubiertas de chocolate con sprinkles', price: 2.99, cost: 1.20, stock: 40, category: 'Donas', image: 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      // === ESPECIALES ===
      { id: 'prod-025', name: 'Caja de Trufas (12 uds)', description: 'Trufas artesanales de chocolate surtidas', price: 15.99, cost: 8.00, stock: 15, category: 'Especiales', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-026', name: 'Cake Pops (6 uds)', description: 'Bolitas de bizcocho cubiertas de chocolate', price: 8.99, cost: 4.00, stock: 20, category: 'Especiales', image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-027', name: 'Macarons (6 uds)', description: 'Macarons franceses de sabores surtidos', price: 12.99, cost: 7.00, stock: 15, category: 'Especiales', image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod-028', name: 'Eclair de Chocolate', description: 'Eclair relleno de crema pastelera con chocolate', price: 4.99, cost: 2.50, stock: 25, category: 'Especiales', image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=400&h=300&fit=crop', active: true, createdAt: new Date(), updatedAt: new Date() }
    ];
  }

  // Simular Firestore Timestamp
  createTimestamp(date = new Date()) {
    return {
      seconds: Math.floor(date.getTime() / 1000),
      toDate: () => date
    };
  }

  generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Guardar en localStorage para persistencia
  save() {
    try {
      localStorage.setItem('mockProducts', JSON.stringify(this.products));
      localStorage.setItem('mockOrders', JSON.stringify(this.orders));
      localStorage.setItem('mockInvoices', JSON.stringify(this.invoices));
      localStorage.setItem('mockInventoryMovements', JSON.stringify(this.inventoryMovements));
      localStorage.setItem('mockInvoiceCounter', this.invoiceCounter.toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Cargar desde localStorage
  load() {
    try {
      const products = localStorage.getItem('mockProducts');
      const orders = localStorage.getItem('mockOrders');
      const invoices = localStorage.getItem('mockInvoices');
      const movements = localStorage.getItem('mockInventoryMovements');
      const counter = localStorage.getItem('mockInvoiceCounter');

      if (products) this.products = JSON.parse(products);
      if (orders) this.orders = JSON.parse(orders);
      if (invoices) this.invoices = JSON.parse(invoices);
      if (movements) this.inventoryMovements = JSON.parse(movements);
      if (counter) this.invoiceCounter = parseInt(counter);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
}

export const mockDB = new MockDatabase();
mockDB.load();