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
      {
        id: 'prod-001',
        name: 'Pastel de Chocolate',
        description: 'Delicioso pastel de chocolate con crema',
        price: 25.99,
        cost: 15.00,
        stock: 15,
        category: 'Pasteles',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-002',
        name: 'Pastel de Vainilla',
        description: 'Suave pastel de vainilla con betún',
        price: 22.99,
        cost: 13.00,
        stock: 20,
        category: 'Pasteles',
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-003',
        name: 'Galletas de Avena',
        description: 'Galletas caseras de avena con pasas',
        price: 8.99,
        cost: 4.00,
        stock: 50,
        category: 'Galletas',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-004',
        name: 'Cupcakes Red Velvet',
        description: 'Cupcakes de terciopelo rojo con frosting',
        price: 3.50,
        cost: 1.50,
        stock: 8,
        category: 'Cupcakes',
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-005',
        name: 'Pan Integral',
        description: 'Pan integral recién horneado',
        price: 4.99,
        cost: 2.00,
        stock: 30,
        category: 'Panes',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-006',
        name: 'Donas Glaseadas',
        description: 'Donas suaves con glaseado de chocolate',
        price: 2.50,
        cost: 1.00,
        stock: 5,
        category: 'Donas',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-007',
        name: 'Brownies',
        description: 'Brownies de chocolate con nueces',
        price: 5.99,
        cost: 2.50,
        stock: 25,
        category: 'Postres',
        image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod-008',
        name: 'Cheesecake',
        description: 'Cheesecake de fresa',
        price: 28.99,
        cost: 16.00,
        stock: 0,
        category: 'Pasteles',
        image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
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