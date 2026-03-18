# 🚀 Inicio Rápido - Postrecitos de Mamá

## ✅ La aplicación ya está corriendo!

**URL Principal:** http://localhost:5173/

## 🌐 Dos Interfaces Disponibles

### 🛒 Tienda Online (Clientes)
**URL:** http://localhost:5173/store

- Catálogo público de productos
- Carrito de compras
- Realizar pedidos online
- Ver historial de pedidos
- **No requiere login**

### 🔐 Sistema Administrativo (Empleados)
**URL:** http://localhost:5173/login

Credenciales de acceso:

#### Opción 1: Administrador (Recomendado)
```
Email: admin@postrecitos.com
Contraseña: 123456
```
**Acceso completo:** Dashboard, Productos, Inventario, Ventas, Facturas, Historial

#### Opción 2: Empleado
```
Email: empleado@postrecitos.com
Contraseña: 123456
```
**Acceso limitado:** Dashboard básico, Ventas, Facturas, Historial

## 🎯 Prueba Rápida - Tienda Online (3 minutos)

### 1️⃣ Explorar Catálogo (1 minuto)
- Abre http://localhost:5173/store
- Navega por los productos
- Usa la búsqueda para encontrar "chocolate"
- Filtra por categoría "Pasteles"

### 2️⃣ Agregar al Carrito (1 minuto)
- Click en un producto para ver detalles
- Click en "Agregar al Carrito"
- Agrega varios productos
- Click en el icono del carrito (esquina superior derecha)

### 3️⃣ Realizar Pedido (1 minuto)
- En el carrito, click en "Realizar Pedido"
- Completa el formulario:
  - Nombre: Juan Pérez
  - Teléfono: 809-555-1234
  - Dirección: Calle Principal #123
- Selecciona método de pago
- Click en "Confirmar Pedido"
- ✅ ¡Pedido completado!

## 🎯 Prueba Rápida - Sistema Admin (5 minutos)

### 1️⃣ Login (30 segundos)
- Abre http://localhost:5173/login
- Usa: admin@postrecitos.com / 123456
- Click en "Iniciar Sesión"

### 2️⃣ Explorar Dashboard (1 minuto)
- Ver estadísticas del día
- Revisar alertas de stock bajo
- Ver productos agotados

### 3️⃣ Realizar una Venta (2 minutos)
- Click en "Ventas" en el menú lateral
- Buscar "Pastel de Chocolate"
- Click en el producto para agregarlo al carrito
- Ajustar cantidad si deseas
- Click en el botón del carrito en la navbar
- Seleccionar método de pago
- Click en "Procesar Venta"
- ✅ ¡Venta completada!

### 4️⃣ Ver Factura (1 minuto)
- Click en "Facturas" en el menú
- Ver la factura recién generada
- Click en el botón de descarga (📥)
- Se descarga el PDF automáticamente

### 5️⃣ Verificar Inventario (30 segundos)
- Click en "Inventario"
- Ver el movimiento de salida registrado
- Verificar que el stock se descontó

## 🎨 Funcionalidades Destacadas

### 🛒 Tienda Online (Nuevo)
- 🌐 Catálogo público de productos
- 🛍️ Carrito de compras global
- 📝 Formulario de pedido con información de cliente
- ✅ Confirmación de pedido con número único
- 📋 Historial de pedidos para clientes
- 📱 Diseño responsive para móviles

### 📦 Gestión de Productos
- ➕ Crear nuevos productos
- ✏️ Editar productos existentes
- 🗑️ Eliminar (desactivar) productos
- 🔍 Buscar y filtrar por categoría
- ⚠️ Alertas de stock bajo

### 💰 Punto de Venta (POS)
- 🛒 Carrito de compras intuitivo
- 🔢 Ajuste de cantidades
- 💳 Múltiples métodos de pago
- 🧮 Cálculo automático de IVA
- ✅ Validación de stock

### 📊 Dashboard Inteligente
- 💵 Ventas del día en tiempo real
- 📈 Estadísticas de pedidos
- ⚠️ Alertas de inventario
- 🏆 Productos más vendidos

### 📄 Facturación Automática
- 🔢 Numeración secuencial
- 📥 Descarga en PDF
- 📋 Historial completo
- 🔍 Búsqueda y filtros

### 📦 Control de Inventario
- 📉 Descuento automático en ventas
- 📈 Ajustes manuales de stock
- 📜 Historial de movimientos
- 📊 Resumen de inventario

## 💡 Tips Útiles

### Atajos de Teclado
- `Ctrl + R` - Recargar página
- `F12` - Abrir consola de desarrollador
- `Ctrl + Shift + I` - Inspeccionar elemento

### Navegación Rápida
- Usa el menú lateral para cambiar entre secciones
- El dashboard es tu punto de partida
- Las alertas te guían a productos que necesitan atención

### Datos de Prueba
- 8 productos precargados
- Diferentes categorías (Pasteles, Galletas, Panes, etc.)
- Algunos con stock bajo para probar alertas
- Un producto agotado para probar validaciones

## 🔄 Resetear Datos

Si quieres empezar de cero:

1. Abre la consola del navegador (F12)
2. Ejecuta: `localStorage.clear()`
3. Recarga la página (F5)
4. Vuelve a hacer login

## 📱 Responsive Design

La aplicación funciona en:
- 💻 Desktop (óptimo)
- 📱 Tablets
- 📱 Móviles

## 🎯 Casos de Uso Reales

### Escenario 1: Venta Matutina
1. Cliente llega y pide 2 pasteles de chocolate
2. Empleado busca el producto en POS
3. Agrega 2 unidades al carrito
4. Cliente paga en efectivo
5. Se procesa la venta
6. Se imprime/descarga factura
7. Stock se actualiza automáticamente

### Escenario 2: Reposición de Inventario
1. Llega nueva hornada de galletas
2. Admin va a "Inventario"
3. Click en "Ajustar Stock"
4. Selecciona "Galletas de Avena"
5. Tipo: Entrada
6. Cantidad: 50
7. Motivo: "Reposición - Hornada matutina"
8. Se registra el movimiento

### Escenario 3: Cierre del Día
1. Admin revisa "Dashboard"
2. Ve total de ventas del día
3. Revisa "Historial de Ventas"
4. Exporta reporte a CSV
5. Verifica productos con bajo stock
6. Planifica reposición para mañana

## 🆘 Solución de Problemas

### La página no carga
- Verifica que el servidor esté corriendo
- Revisa http://localhost:3000/
- Recarga con Ctrl + F5

### No puedo hacer login
- Verifica las credenciales
- Email: admin@postrecitos.com
- Contraseña: 123456 (exactamente)

### Los datos desaparecieron
- Limpiaste el localStorage
- Recarga la página para datos iniciales

### Error al procesar venta
- Verifica que haya stock disponible
- Revisa la consola del navegador (F12)

## 📚 Documentación Completa

- `README.md` - Documentación técnica completa
- `DEMO-MODE.md` - Información sobre el modo demo
- `QUICK-START.md` - Esta guía

## 🎉 ¡Listo para Usar!

La aplicación está completamente funcional y lista para demostración.

**Próximos pasos:**
1. Explora todas las funcionalidades
2. Prueba diferentes escenarios
3. Personaliza según tus necesidades
4. Migra a Firebase para producción

---

**¿Preguntas?** Revisa la documentación completa en README.md

**¡Disfruta usando Postrecitos de Mamá!** 🍰🎂🧁