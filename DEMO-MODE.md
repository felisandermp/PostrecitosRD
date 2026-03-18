# 🎭 Modo Demo - Postrecitos de Mamá

La aplicación está actualmente configurada en **MODO DEMO** con datos simulados en memoria.

## 🔐 Credenciales de Acceso

### Administrador
- **Email:** admin@postrecitos.com
- **Contraseña:** 123456
- **Permisos:** Acceso completo al sistema

### Empleado
- **Email:** empleado@postrecitos.com
- **Contraseña:** 123456
- **Permisos:** Ventas, dashboard básico, facturas e historial

## ✨ Características del Modo Demo

- ✅ Autenticación funcional sin Firebase
- ✅ Datos de productos precargados (8 productos de ejemplo)
- ✅ Sistema de ventas completamente funcional
- ✅ Control de inventario con actualizaciones en tiempo real
- ✅ Generación de facturas en PDF
- ✅ Historial de ventas y estadísticas
- ✅ Persistencia de datos en localStorage
- ✅ Todas las funcionalidades del sistema operativas

## 📦 Productos de Ejemplo

El sistema incluye productos precargados:
1. Pastel de Chocolate - $25.99 (Stock: 15)
2. Pastel de Vainilla - $22.99 (Stock: 20)
3. Galletas de Avena - $8.99 (Stock: 50)
4. Cupcakes Red Velvet - $3.50 (Stock: 8) ⚠️ Bajo stock
5. Pan Integral - $4.99 (Stock: 30)
6. Donas Glaseadas - $2.50 (Stock: 5) ⚠️ Bajo stock
7. Brownies - $5.99 (Stock: 25)
8. Cheesecake - $28.99 (Stock: 0) ❌ Agotado

## 💾 Persistencia de Datos

Los datos se guardan automáticamente en localStorage del navegador:
- Productos
- Pedidos/Ventas
- Facturas
- Movimientos de inventario

**Nota:** Los datos persisten entre sesiones pero se pueden perder si se limpia el caché del navegador.

## 🔄 Cambiar a Firebase Real

Para usar Firebase en producción:

1. **Configurar Firebase:**
   ```javascript
   // Editar src/services/firebase.js
   const firebaseConfig = {
     apiKey: "tu-api-key",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id",
     // ... resto de configuración
   };
   ```

2. **Activar servicios de Firebase:**
   
   En cada archivo de servicio (`authService.js`, `productService.js`, etc.):
   - Descomentar el código de Firebase
   - Comentar o eliminar las importaciones mock
   - Cambiar la exportación al servicio de Firebase

   Ejemplo en `src/services/authService.js`:
   ```javascript
   // Comentar esta línea:
   // import { authService as mockAuthService } from './mockAuth';
   // export const authService = mockAuthService;

   // Descomentar el código de Firebase
   import { signInWithEmailAndPassword, ... } from 'firebase/auth';
   export const authService = { ... };
   ```

3. **Habilitar Firestore:**
   - Crear las colecciones necesarias
   - Configurar reglas de seguridad
   - Crear índices compuestos

4. **Crear usuario administrador:**
   - Usar Firebase Console o el script proporcionado en README.md

## 🧪 Probar el Sistema

### Flujo de Prueba Recomendado:

1. **Login como Administrador**
   - Explorar el dashboard
   - Ver alertas de stock bajo

2. **Gestión de Productos**
   - Crear un nuevo producto
   - Editar productos existentes
   - Filtrar por categoría

3. **Realizar una Venta**
   - Ir a "Ventas"
   - Agregar productos al carrito
   - Procesar venta
   - Verificar descuento de stock

4. **Ver Factura**
   - Ir a "Facturas"
   - Descargar PDF de la factura generada

5. **Control de Inventario**
   - Ver movimientos de inventario
   - Realizar ajuste manual de stock
   - Verificar alertas

6. **Historial de Ventas**
   - Ver estadísticas
   - Filtrar por fecha
   - Exportar a CSV

## 🐛 Limitaciones del Modo Demo

- ❌ No hay sincronización entre dispositivos
- ❌ Los datos se pierden al limpiar caché
- ❌ No hay backup automático
- ❌ No hay autenticación real de Firebase
- ❌ No se pueden crear nuevos usuarios

## 🚀 Ventajas del Modo Demo

- ✅ No requiere configuración de Firebase
- ✅ Funciona offline completamente
- ✅ Ideal para pruebas y demostraciones
- ✅ Rápido de configurar
- ✅ Sin costos de Firebase
- ✅ Perfecto para desarrollo local

## 📝 Notas Importantes

1. **Datos de Prueba:** Todos los datos son simulados y se pueden resetear limpiando localStorage
2. **Rendimiento:** El modo demo es más rápido que Firebase para operaciones locales
3. **Desarrollo:** Ideal para desarrollo y pruebas sin necesidad de conexión a internet
4. **Producción:** Para producción real, se recomienda migrar a Firebase

## 🔧 Resetear Datos

Para resetear todos los datos a su estado inicial:

```javascript
// Abrir consola del navegador (F12) y ejecutar:
localStorage.clear();
location.reload();
```

O simplemente cerrar sesión y limpiar el caché del navegador.

## 📞 Soporte

Si encuentras algún problema en modo demo:
1. Verifica la consola del navegador (F12)
2. Limpia localStorage y recarga
3. Verifica que todos los archivos mock estén correctamente importados

---

**¡Disfruta probando Postrecitos de Mamá en modo demo!** 🍰🎂🧁