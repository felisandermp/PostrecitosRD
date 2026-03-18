# 🛒 Tienda Online - Postrecitos de Mamá

## Descripción

Frontend de tienda online para que los clientes puedan realizar pedidos de productos de repostería de forma fácil y rápida.

## 🌐 Rutas Públicas

### Tienda Online (Clientes)
- **`/store`** - Catálogo de productos con búsqueda y filtros
- **`/store/orders`** - Historial de pedidos del cliente
- **`/store/order-confirmation`** - Confirmación de pedido realizado

### Sistema Administrativo (Empleados)
- **`/login`** - Acceso al sistema administrativo
- **`/admin/*`** - Panel de administración (requiere autenticación)

## ✨ Características de la Tienda

### 1. Catálogo de Productos
- Grid responsive de productos con imágenes
- Búsqueda en tiempo real
- Filtros por categoría
- Vista detallada de producto en modal
- Indicadores de stock disponible

### 2. Carrito de Compras
- Carrito global accesible desde navbar
- Agregar/eliminar productos
- Ajustar cantidades con validación de stock
- Cálculo automático de subtotal, IVA (16%) y total
- Persistencia en localStorage

### 3. Proceso de Checkout
- Formulario de información del cliente:
  - Nombre completo (requerido)
  - Teléfono (requerido)
  - Email (opcional)
  - Dirección de entrega (opcional)
  - Notas adicionales (opcional)
- Selección de método de pago:
  - 💵 Efectivo
  - 💳 Tarjeta
  - 🏦 Transferencia

### 4. Confirmación de Pedido
- Página de confirmación con número de pedido
- Resumen completo del pedido
- Información de contacto
- Opciones para seguir comprando o ver pedidos

### 5. Mis Pedidos
- Historial de pedidos realizados
- Estado del pedido (pendiente, confirmado, en preparación, etc.)
- Detalles de cada pedido
- Información de entrega

## 🎨 Componentes Nuevos

### `Store.jsx`
Página principal de la tienda con:
- Hero section con branding
- Búsqueda de productos
- Filtros por categoría
- Grid de productos
- Modal de detalle de producto

### `StoreNavbar.jsx`
Navbar para la tienda online con:
- Logo de la marca
- Enlaces de navegación
- Botón de carrito con contador
- Acceso al panel admin

### `CustomerCartOffcanvas.jsx`
Carrito lateral para clientes con:
- Lista de productos en el carrito
- Controles de cantidad
- Formulario de checkout
- Resumen de totales
- Procesamiento de pedido

### `OrderConfirmation.jsx`
Página de confirmación con:
- Mensaje de éxito
- Número de pedido
- Resumen completo
- Información de contacto

### `CustomerOrders.jsx`
Historial de pedidos con:
- Lista de pedidos realizados
- Estado de cada pedido
- Detalles y totales

## 🎯 Flujo de Usuario

1. **Explorar Productos** → Cliente navega por `/store`
2. **Agregar al Carrito** → Click en productos para agregar
3. **Ver Carrito** → Click en botón de carrito en navbar
4. **Realizar Pedido** → Completar formulario de checkout
5. **Confirmación** → Ver resumen y número de pedido
6. **Seguimiento** → Revisar pedidos en `/store/orders`

## 💾 Almacenamiento

Los pedidos de clientes se guardan en:
```javascript
localStorage.getItem('customerOrders')
```

Estructura del pedido:
```javascript
{
  id: "timestamp",
  customer: {
    name: "string",
    phone: "string",
    email: "string",
    address: "string",
    notes: "string"
  },
  products: [...],
  subtotal: number,
  tax: number,
  total: number,
  paymentMethod: "efectivo|tarjeta|transferencia",
  date: Date,
  status: "pendiente"
}
```

## 🎨 Diseño

- **Colores**: Marrón (#8B4513) y naranja (#D2691E)
- **Estilo**: Moderno, limpio y responsive
- **Framework**: Bootstrap 5
- **Iconos**: Bootstrap Icons

## 📱 Responsive

- Desktop: Grid de 4 columnas
- Tablet: Grid de 3 columnas
- Mobile: Grid de 1-2 columnas
- Carrito: Offcanvas adaptativo

## 🔄 Integración con Sistema Admin

El sistema administrativo puede:
- Ver pedidos de clientes en el dashboard
- Gestionar productos que aparecen en la tienda
- Controlar inventario en tiempo real
- Generar facturas de pedidos online

## 🚀 Próximas Mejoras

- [ ] Integración con Firebase para pedidos en tiempo real
- [ ] Notificaciones push para clientes
- [ ] Sistema de seguimiento de pedidos
- [ ] Galería de imágenes por producto
- [ ] Reviews y calificaciones
- [ ] Cupones de descuento
- [ ] Programa de lealtad
- [ ] Integración con WhatsApp

## 📞 Contacto

- **Teléfono**: (809) 753-5382
- **Email**: admin@postrecitos.com

---

**Nota**: Actualmente funciona en modo DEMO con localStorage. Para producción, integrar con Firebase Firestore.
