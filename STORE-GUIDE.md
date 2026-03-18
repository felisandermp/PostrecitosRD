# 🛍️ Guía de Uso - Tienda Online

## Para Clientes

### 1. Explorar Productos

1. Visita `http://localhost:5173/store`
2. Navega por el catálogo de productos
3. Usa la barra de búsqueda para encontrar productos específicos
4. Filtra por categorías (Pasteles, Galletas, Panes, etc.)

### 2. Ver Detalles de Producto

- Click en la imagen del producto para ver detalles completos
- Verás: descripción, precio, stock disponible
- **Selecciona la cantidad** que deseas con los botones +/- o escribiendo directamente
- El total se calcula automáticamente
- Click en "Agregar al Carrito" para añadir el producto con la cantidad seleccionada

### 3. Gestionar Carrito

- Click en el icono del carrito en la navbar (esquina superior derecha)
- Verás todos los productos agregados
- Ajusta cantidades con los botones +/-
- Elimina productos con el icono de basura
- El total se calcula automáticamente (incluye IVA 16%)

### 4. Realizar Pedido

1. En el carrito, click en "Realizar Pedido"
2. Completa el formulario:
   - **Nombre completo** (requerido)
   - **Teléfono** (requerido)
   - **Email** (opcional)
   - **Dirección de entrega** (opcional)
   - **Método de pago**: Efectivo, Tarjeta o Transferencia
   - **Notas adicionales** (opcional)
3. Click en "Confirmar Pedido"
4. Recibirás un número de pedido

### 5. Ver Mis Pedidos

- Accede a `/store/orders` desde el menú
- Verás el historial de todos tus pedidos
- Cada pedido muestra:
  - Número de pedido
  - Fecha y hora
  - Productos ordenados
  - Total pagado
  - Estado del pedido
  - Método de pago

## Estados de Pedido

- 🟡 **Pendiente**: Pedido recibido, esperando confirmación
- 🔵 **Confirmado**: Pedido confirmado por la tienda
- 🟣 **En Preparación**: Preparando tu pedido
- 🟢 **Listo**: Listo para entrega/recogida
- ⚫ **Entregado**: Pedido completado
- 🔴 **Cancelado**: Pedido cancelado

## Métodos de Pago

### 💵 Efectivo
- Paga al momento de la entrega
- Ten el monto exacto si es posible

### 💳 Tarjeta
- Pago con tarjeta de crédito/débito
- Se procesará al confirmar el pedido

### 🏦 Transferencia
- Realiza la transferencia bancaria
- Envía comprobante por WhatsApp

## Contacto

¿Preguntas sobre tu pedido?

- 📞 **Teléfono**: (809) 753-5382
- 📧 **Email**: admin@postrecitos.com
- 💬 **WhatsApp**: Disponible en horario de atención

## Horarios de Atención

- **Lunes a Viernes**: 8:00 AM - 6:00 PM
- **Sábados**: 9:00 AM - 5:00 PM
- **Domingos**: Cerrado

## Políticas

### Entregas
- Entregas disponibles en zona metropolitana
- Tiempo estimado: 24-48 horas
- Costo de envío según ubicación

### Cancelaciones
- Puedes cancelar hasta 2 horas después de realizar el pedido
- Contacta por teléfono o WhatsApp

### Devoluciones
- Productos frescos no admiten devolución
- Reclamos por calidad: dentro de las primeras 2 horas

---

## Para Administradores

### Gestionar Pedidos Online

Los pedidos de clientes se almacenan en `localStorage` bajo la clave `customerOrders`.

Para ver pedidos en el sistema admin:
1. Los pedidos online aparecerán en el Dashboard
2. Puedes procesarlos desde el módulo de Ventas
3. Genera facturas desde el módulo de Facturas

### Actualizar Productos

Los productos que aparecen en la tienda online son los mismos del sistema administrativo:
- Solo productos **activos** aparecen en la tienda
- El **stock** se actualiza en tiempo real
- Las **imágenes** de Unsplash se muestran automáticamente

### Cambiar Estados de Pedido

Actualmente en modo DEMO, los estados se pueden cambiar manualmente editando `localStorage`.

En producción con Firebase:
- Los estados se actualizarán desde el panel admin
- Los clientes recibirán notificaciones automáticas

---

**¡Disfruta de nuestros deliciosos postres! 🍰**
