# 🔧 Solución: Sincronización de Stock entre Tienda y Admin

## Problema Identificado

Los pedidos online NO estaban:
1. ❌ Descontando el stock de productos
2. ❌ Registrando movimientos de inventario
3. ❌ Apareciendo en el sistema admin

## Causa Raíz

El sistema usa **dos fuentes de datos diferentes**:
- **mockDB**: Base de datos en memoria que se guarda en localStorage con claves específicas
- **localStorage directo**: Los pedidos online guardaban con claves diferentes

### Claves de localStorage:

**mockDB usa:**
- `mockProducts` → Productos
- `mockOrders` → Pedidos
- `mockInvoices` → Facturas
- `mockInventoryMovements` → Movimientos de inventario

**Pedidos online usaban:**
- `products` → ❌ Diferente
- `orders` → ❌ Diferente
- `invoices` → ❌ Diferente
- `inventoryMovements` → ❌ Diferente

## ✅ Solución Implementada

### 1. CustomerCartOffcanvas.jsx

Ahora cuando se procesa un pedido online:

```javascript
// ✅ Lee de mockProducts
const products = JSON.parse(localStorage.getItem('mockProducts') || '[]');

// ✅ Descuenta stock
for (const item of cart) {
  const product = products.find(p => p.id === item.productId);
  if (product) {
    product.stock -= item.quantity;
    product.updatedAt = new Date();
  }
}

// ✅ Guarda en mockProducts
localStorage.setItem('mockProducts', JSON.stringify(products));

// ✅ Registra movimientos en mockInventoryMovements
const inventoryMovements = JSON.parse(localStorage.getItem('mockInventoryMovements') || '[]');
inventoryMovements.push({
  id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  productId: item.productId,
  type: 'salida',
  quantity: item.quantity,
  userId: 'online-customer',
  reason: `Venta Online - Pedido: ${newOrder.id}`,
  date: timestamp,
  createdAt: timestamp
});
localStorage.setItem('mockInventoryMovements', JSON.stringify(inventoryMovements));
```

### 2. Validación de Stock

Antes de procesar el pedido, se verifica el stock:

```javascript
// Verificar stock disponible
for (const item of cart) {
  const product = products.find(p => p.id === item.productId);
  if (!product) {
    throw new Error(`Producto ${item.name} no encontrado`);
  }
  if (product.stock < item.quantity) {
    throw new Error(`Stock insuficiente para ${item.name}. Disponible: ${product.stock}`);
  }
}
```

### 3. mockServices.js

Actualizado para mantener compatibilidad:

```javascript
// Guardar en mockDB
mockDB.save();

// También guardar en localStorage con claves alternativas
const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
if (!localOrders.find(o => o.id === order.id)) {
  localOrders.push(order);
  localStorage.setItem('orders', JSON.stringify(localOrders));
}
```

### 4. Lectura Híbrida

Los servicios ahora leen de ambas fuentes:

```javascript
async getOrders(limit = 50) {
  // Combinar pedidos de mockDB y localStorage
  const mockOrders = [...mockDB.orders];
  const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Convertir y combinar
  const allOrders = [...mockOrders, ...formattedLocalOrders];
  
  // Eliminar duplicados
  const uniqueOrders = allOrders.filter((order, index, self) =>
    index === self.findIndex(o => o.id === order.id)
  );
  
  return uniqueOrders.sort(...);
}
```

## 🎯 Resultado

Ahora cuando un cliente hace un pedido online:

### ✅ Stock se Descuenta
- El producto reduce su cantidad disponible
- Se actualiza en `mockProducts`
- Visible inmediatamente en el admin

### ✅ Movimiento Registrado
- Se crea un registro en `mockInventoryMovements`
- Tipo: "salida"
- Razón: "Venta Online - Pedido: {id}"
- Visible en la página de Inventario

### ✅ Pedido Visible
- Aparece en Dashboard (Pedidos Recientes)
- Aparece en Historial de Ventas
- Badge 🌐 "Online" para identificación

### ✅ Factura Generada
- Factura automática con número único
- Información completa del cliente
- Descargable en PDF

## 🧪 Cómo Probar

### Paso 1: Verificar Stock Inicial
```
1. Login en /admin/dashboard
2. Ir a Productos
3. Anotar stock de "Pastel de Chocolate" (ej: 15 unidades)
```

### Paso 2: Hacer Pedido Online
```
1. Ir a /store
2. Agregar "Pastel de Chocolate" x2 al carrito
3. Completar checkout:
   - Nombre: Juan Pérez
   - Teléfono: 809-555-1234
4. Confirmar pedido
```

### Paso 3: Verificar en Admin
```
1. Ir a /admin/dashboard
2. Ver pedido en "Pedidos Recientes" con badge 🌐
3. Ir a Productos
4. Verificar stock: 15 - 2 = 13 ✅
5. Ir a Inventario
6. Ver movimiento de salida registrado ✅
7. Ir a Facturas
8. Ver factura generada ✅
```

## 📊 Flujo Completo

```
Cliente en /store
    ↓
Agrega productos al carrito
    ↓
Completa formulario de checkout
    ↓
Click "Confirmar Pedido"
    ↓
┌─────────────────────────────────┐
│ CustomerCartOffcanvas.jsx       │
├─────────────────────────────────┤
│ 1. Verificar stock disponible  │
│ 2. Crear pedido                 │
│ 3. Descontar stock              │ ← ✅ NUEVO
│ 4. Registrar movimiento         │ ← ✅ NUEVO
│ 5. Generar factura              │
│ 6. Guardar todo en localStorage │
└─────────────────────────────────┘
    ↓
Confirmación al cliente
    ↓
Admin ve cambios inmediatamente
```

## 🔍 Verificación de Datos

### En Consola del Navegador:

```javascript
// Ver productos con stock actualizado
console.log(JSON.parse(localStorage.getItem('mockProducts')));

// Ver movimientos de inventario
console.log(JSON.parse(localStorage.getItem('mockInventoryMovements')));

// Ver pedidos
console.log(JSON.parse(localStorage.getItem('orders')));

// Ver facturas
console.log(JSON.parse(localStorage.getItem('invoices')));
```

## ⚠️ Notas Importantes

### Persistencia
- Los cambios persisten en localStorage
- Sobreviven a recargas de página
- Se mantienen hasta que se limpie el navegador

### Validaciones
- ✅ Stock insuficiente → Error antes de procesar
- ✅ Producto no encontrado → Error antes de procesar
- ✅ Campos requeridos → Validación en formulario

### Sincronización
- ✅ Cambios son inmediatos
- ✅ No requiere recarga de página
- ✅ Admin y tienda comparten mismos datos

## 🚀 Próximas Mejoras

### Firebase Integration
```javascript
// En producción, usar Firestore
await runTransaction(db, async (transaction) => {
  // Verificar stock
  // Crear pedido
  // Descontar stock
  // Registrar movimiento
  // Todo en una transacción atómica
});
```

### Notificaciones
- Email al admin cuando hay nuevo pedido online
- SMS al cliente con confirmación
- WhatsApp con link de seguimiento

### Gestión de Pedidos
- Módulo dedicado para pedidos online
- Cambiar estados (pendiente → confirmado → preparando → listo)
- Asignar pedidos a empleados
- Notas internas

---

**Estado**: ✅ Implementado y Funcionando
**Versión**: 1.1.0
**Fecha**: 2024
