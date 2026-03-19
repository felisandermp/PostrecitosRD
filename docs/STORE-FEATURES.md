# 🛍️ Características Técnicas - Tienda Online

## Arquitectura

### Separación de Interfaces

```
┌─────────────────────────────────────────┐
│         Postrecitos de Mamá             │
├─────────────────────────────────────────┤
│                                         │
│  🛒 TIENDA ONLINE    │  🔐 ADMIN       │
│  (Pública)           │  (Protegida)    │
│                      │                  │
│  /store              │  /admin/*       │
│  /store/orders       │  /login         │
│  /store/order-conf   │                 │
│                      │                  │
│  StoreNavbar         │  Navbar         │
│  CustomerCart        │  CartOffcanvas  │
│                      │                  │
└──────────┬───────────┴─────────┬────────┘
           │                     │
           └──────────┬──────────┘
                      │
              ┌───────▼────────┐
              │  CartContext   │
              │  (Compartido)  │
              └────────────────┘
```

## Componentes Creados

### 1. Store.jsx
**Propósito**: Página principal de la tienda online

**Características**:
- Hero section con branding
- Búsqueda en tiempo real
- Filtros por categoría
- Grid responsive de productos
- Modal de detalle de producto
- Integración con CartContext

**Estado Local**:
```javascript
{
  products: [],
  filteredProducts: [],
  categories: [],
  selectedCategory: 'Todos',
  searchTerm: '',
  loading: true,
  selectedProduct: null
}
```

### 2. StoreNavbar.jsx
**Propósito**: Navegación para la tienda online

**Características**:
- Logo de la marca (circular, 50px)
- Enlaces de navegación
- Contador de carrito con badge
- Botón de acceso al admin
- Responsive con hamburger menu

### 3. CustomerCartOffcanvas.jsx
**Propósito**: Carrito lateral para clientes

**Características**:
- Vista de productos en carrito
- Controles de cantidad
- Formulario de checkout en dos pasos
- Validación de campos requeridos
- Procesamiento de pedido
- Integración con CartContext

**Estado Local**:
```javascript
{
  customerInfo: {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  },
  paymentMethod: 'efectivo',
  processing: false,
  showCheckoutForm: false
}
```

### 4. OrderConfirmation.jsx
**Propósito**: Página de confirmación de pedido

**Características**:
- Mensaje de éxito animado
- Número de pedido único
- Resumen completo del pedido
- Información de contacto
- Navegación a tienda o historial

### 5. CustomerOrders.jsx
**Propósito**: Historial de pedidos del cliente

**Características**:
- Lista de pedidos realizados
- Badges de estado con colores
- Detalles de cada pedido
- Formato de fecha localizado
- Estado vacío con call-to-action

## Flujo de Datos

### Agregar Producto al Carrito

```
Store.jsx
  └─> handleAddToCart(product)
       └─> CartContext.addToCart(product, 1)
            ├─> Validar stock
            ├─> Agregar/actualizar item
            ├─> Actualizar localStorage
            └─> Actualizar contador en navbar
```

### Realizar Pedido

```
CustomerCartOffcanvas.jsx
  └─> handleCheckout()
       ├─> Validar formulario
       ├─> Crear objeto de pedido
       ├─> Guardar en localStorage
       ├─> Limpiar carrito
       └─> Redirigir a confirmación
```

### Persistencia de Datos

```javascript
// Carrito (compartido con admin)
localStorage.setItem('cart', JSON.stringify(cart))

// Pedidos de clientes
localStorage.setItem('customerOrders', JSON.stringify(orders))
```

## Estilos CSS

### Variables Personalizadas
```css
:root {
  --primary-color: #8B4513;
  --secondary-color: #D2691E;
  --accent-color: #F4A460;
}
```

### Clases Principales
- `.hero-section` - Banner superior
- `.product-card-store` - Tarjetas de producto
- `.store-page` - Contenedor principal
- `.checkout-form` - Formulario de pedido

### Animaciones
- `fadeIn` - Entrada de elementos
- `scaleIn` - Confirmación de pedido
- `loading` - Skeleton loaders

## Responsive Design

### Breakpoints
```css
/* Desktop */
@media (min-width: 992px) {
  .col-lg-3 { /* 4 columnas */ }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 991px) {
  .col-md-4 { /* 3 columnas */ }
}

/* Mobile */
@media (max-width: 767px) {
  .col-12 { /* 1 columna */ }
  .offcanvas-end { width: 100% !important; }
}
```

## Validaciones

### Stock
```javascript
// Al agregar al carrito
if (existingItem.quantity + quantity <= product.stock) {
  // Permitir
} else {
  throw new Error('Stock insuficiente');
}
```

### Formulario
```javascript
// Campos requeridos
if (!customerInfo.name || !customerInfo.phone) {
  alert('Por favor completa tu nombre y teléfono');
  return;
}
```

### Carrito Vacío
```javascript
if (cart.length === 0) {
  alert('El carrito está vacío');
  return;
}
```

## Integración con Sistema Admin

### Productos Compartidos
- Los productos vienen de `productService.getActiveProducts()`
- Solo productos activos aparecen en la tienda
- El stock se valida en tiempo real

### Carrito Compartido
- `CartContext` es usado por ambas interfaces
- El admin usa `CartOffcanvas`
- La tienda usa `CustomerCartOffcanvas`

### Pedidos
- Los pedidos de clientes se guardan en `customerOrders`
- Los pedidos del admin se guardan en `orders`
- Ambos pueden integrarse en el futuro

## Mejoras Futuras

### Fase 1: Firebase Integration
```javascript
// Guardar pedido en Firestore
await addDoc(collection(db, 'customerOrders'), orderData);

// Escuchar cambios en tiempo real
onSnapshot(doc(db, 'customerOrders', orderId), (doc) => {
  updateOrderStatus(doc.data().status);
});
```

### Fase 2: Notificaciones
```javascript
// Email al cliente
await sendEmail({
  to: customerInfo.email,
  subject: 'Pedido Confirmado',
  template: 'order-confirmation',
  data: orderData
});

// WhatsApp al admin
await sendWhatsApp({
  to: '+18097535382',
  message: `Nuevo pedido #${orderId}`
});
```

### Fase 3: Pagos Online
```javascript
// Integración con Stripe
const paymentIntent = await stripe.paymentIntents.create({
  amount: total * 100,
  currency: 'dop',
  metadata: { orderId }
});
```

### Fase 4: Tracking
```javascript
// Estado del pedido en tiempo real
const orderStatus = {
  pendiente: { icon: '🟡', message: 'Recibido' },
  confirmado: { icon: '🔵', message: 'Confirmado' },
  en_preparacion: { icon: '🟣', message: 'Preparando' },
  listo: { icon: '🟢', message: 'Listo' },
  en_camino: { icon: '🚚', message: 'En camino' },
  entregado: { icon: '✅', message: 'Entregado' }
};
```

## Performance

### Optimizaciones Implementadas
- Lazy loading de imágenes
- Debounce en búsqueda (300ms)
- Memoización de filtros
- LocalStorage para persistencia

### Métricas Objetivo
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Seguridad

### Validaciones Client-Side
- Stock disponible
- Campos requeridos
- Formato de email
- Formato de teléfono

### Sanitización
```javascript
// Limpiar inputs
const sanitize = (str) => str.trim().replace(/[<>]/g, '');
```

### Rate Limiting (Futuro)
```javascript
// Limitar pedidos por IP
const MAX_ORDERS_PER_HOUR = 5;
```

## Testing

### Casos de Prueba
1. ✅ Agregar producto al carrito
2. ✅ Actualizar cantidad en carrito
3. ✅ Eliminar producto del carrito
4. ✅ Validar stock insuficiente
5. ✅ Completar formulario de checkout
6. ✅ Validar campos requeridos
7. ✅ Procesar pedido exitosamente
8. ✅ Ver confirmación de pedido
9. ✅ Ver historial de pedidos
10. ✅ Persistencia en localStorage

---

**Documentación Técnica Completa**
Versión: 1.0.0
Última actualización: 2024
