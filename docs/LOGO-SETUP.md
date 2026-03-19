# 🎨 Configuración del Logo - Postrecitos de Mamá

## 📸 Agregar el Logo

Para que el logo aparezca correctamente en la aplicación, sigue estos pasos:

### Paso 1: Guardar la Imagen del Logo

1. **Guarda la imagen del logo** que te proporcioné
2. **Renómbrala** como `logo.png`
3. **Colócala** en la carpeta `public/` del proyecto

```
postrecitos-de-mama/
├── public/
│   └── logo.png  ← Aquí va tu logo
├── src/
└── ...
```

### Paso 2: Verificar la Imagen

La imagen debe tener estas características:
- **Formato:** PNG (preferible) o JPG
- **Tamaño recomendado:** 500x500px o mayor
- **Fondo:** Preferiblemente transparente (PNG)
- **Nombre exacto:** `logo.png` (minúsculas)

### Paso 3: Recargar la Aplicación

1. Si la aplicación está corriendo, recarga la página (F5)
2. El logo debería aparecer en:
   - ✅ Sidebar (menú lateral) - 80x80px circular
   - ✅ Página de Login - 120x120px circular
   - ✅ Facturas PDF (próximamente)

## 🎨 Dónde Aparece el Logo

### 1. Sidebar (Menú Lateral)
```
┌─────────────────┐
│   [LOGO 80px]   │
│  Postrecitos    │
│   de Mamá       │
│                 │
│ • Dashboard     │
│ • Ventas        │
│ • Productos     │
└─────────────────┘
```

### 2. Página de Login
```
┌─────────────────────┐
│                     │
│   [LOGO 120px]      │
│                     │
│  Postrecitos de     │
│      Mamá           │
│                     │
│  [Email]            │
│  [Password]         │
│  [Iniciar Sesión]   │
└─────────────────────┘
```

## 🔧 Solución de Problemas

### El logo no aparece

**Problema:** La imagen no se muestra

**Soluciones:**
1. Verifica que el archivo se llame exactamente `logo.png`
2. Asegúrate de que esté en la carpeta `public/`
3. Recarga la página con Ctrl + F5 (recarga forzada)
4. Verifica la consola del navegador (F12) por errores

### El logo se ve distorsionado

**Problema:** La imagen se ve estirada o cortada

**Soluciones:**
1. Usa una imagen cuadrada (mismo ancho y alto)
2. Tamaño recomendado: 500x500px o 1000x1000px
3. Asegúrate de que la imagen tenga buena resolución

### El logo es muy grande/pequeño

**Problema:** El tamaño no es el adecuado

**Solución:**
Los tamaños están predefinidos en el código:
- Sidebar: 80x80px
- Login: 120x120px

Si quieres cambiarlos, edita:
- `src/components/Sidebar.jsx` (línea con `width: '80px'`)
- `src/pages/Login.jsx` (línea con `width: '120px'`)

## 🎨 Personalización Adicional

### Cambiar el Borde del Logo

En `Sidebar.jsx` y `Login.jsx`, busca:
```javascript
border: '3px solid rgba(255,255,255,0.3)'
```

Puedes cambiar:
- **Grosor:** `3px` → `5px`
- **Color:** `rgba(255,255,255,0.3)` → `#8B4513`
- **Estilo:** Agregar `borderStyle: 'dashed'`

### Agregar Sombra al Logo

Agrega esta línea en el estilo:
```javascript
boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
```

### Hacer el Logo Cuadrado (No Circular)

Cambia:
```javascript
borderRadius: '50%'  // Circular
```

Por:
```javascript
borderRadius: '10px'  // Cuadrado con esquinas redondeadas
```

O:
```javascript
borderRadius: '0'  // Cuadrado perfecto
```

## 📝 Formato de la Imagen

### Opción 1: PNG con Fondo Transparente (Recomendado)
```
✅ Mejor calidad
✅ Se adapta a cualquier fondo
✅ Bordes suaves
```

### Opción 2: PNG con Fondo Blanco
```
✅ Funciona bien
⚠️ Puede verse un cuadrado blanco
```

### Opción 3: JPG
```
✅ Funciona
❌ No soporta transparencia
❌ Puede verse un cuadrado de color
```

## 🚀 Próximos Pasos

Una vez que el logo esté funcionando:

1. ✅ Verifica que aparezca en el Sidebar
2. ✅ Verifica que aparezca en el Login
3. ✅ Prueba en diferentes navegadores
4. ✅ Prueba en móvil (responsive)

## 💡 Tips Adicionales

### Optimizar la Imagen

Para mejor rendimiento:
1. Usa herramientas como [TinyPNG](https://tinypng.com)
2. Reduce el tamaño del archivo sin perder calidad
3. Mantén el archivo bajo 100KB

### Favicon (Icono del Navegador)

Para agregar el logo como favicon:
1. Crea una versión de 32x32px del logo
2. Guárdala como `favicon.ico` en `public/`
3. Actualiza `index.html`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

## 📞 Ayuda

Si tienes problemas:
1. Verifica la ruta del archivo
2. Revisa la consola del navegador (F12)
3. Asegúrate de que el servidor esté corriendo
4. Intenta con una imagen de prueba simple

---

**¡Tu logo de Postrecitos de Mamá está listo para brillar!** ✨🍰