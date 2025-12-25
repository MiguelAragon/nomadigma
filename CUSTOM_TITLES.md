# 📝 Guía de Títulos Personalizados por Página

## ✅ Títulos Eliminados

Se han removido los títulos grandes fijos de:
- ✅ `/blog` - Ya no muestra "Blog" en grande
- ✅ `/destinations` - Ya no muestra "Descubre tu Próxima Aventura"

Las páginas ahora comienzan directamente con el contenido.

---

## 🎯 Cómo Personalizar Títulos

### Método 1: Agregar título opcional en la página

Edita cualquier `page.tsx` y agrega un título cuando lo necesites:

```typescript
// app/(pages)/blog/page.tsx

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto max-w-7xl">
          
          {/* Título opcional - agrégalo solo si quieres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">
              Mi Blog Personal
            </h1>
            <p className="text-muted-foreground">
              Tu descripción aquí
            </p>
          </motion.div>

          {/* Resto del contenido */}
        </div>
      </section>
    </div>
  );
}
```

### Método 2: Título en la pestaña del navegador (SEO)

Los títulos en el navegador se configuran automáticamente:

```
📁 Estructura actual:
app/
├── layout.tsx                 → "Nomadigma - Blog de viajes..."
├── (pages)/
│   ├── blog/
│   │   ├── page.tsx          → "Blog - Nomadigma"
│   │   └── [slug]/
│   │       └── page.tsx      → "Título del Post - Nomadigma"
│   └── destinations/
│       └── page.tsx          → "Destinations - Nomadigma"
```

Para cambiar el título del navegador, agrega metadata:

```typescript
// app/(pages)/tu-pagina/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tu Título',
  description: 'Tu descripción para SEO',
};

export default function TuPagina() {
  // ...
}
```

---

## 🎨 Ejemplos de Títulos Opcionales

### Título Simple
```typescript
<h1 className="text-4xl font-bold mb-6">
  Blog de Viajes
</h1>
```

### Título con Gradiente
```typescript
<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
  Mis Aventuras
</h1>
```

### Título con Descripción
```typescript
<div className="text-center mb-8">
  <h1 className="text-4xl font-bold mb-4">
    Blog
  </h1>
  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
    Historias y guías de viaje
  </p>
</div>
```

### Título con Animación
```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-12"
>
  <h1 className="text-5xl font-bold">
    Tu Título Animado
  </h1>
</motion.div>
```

---

## 🎯 Estado Actual de las Páginas

### `/` (Landing)
- ✅ Tiene hero con "Ship Amazing [Web Apps]"
- No requiere cambios

### `/blog`
- ✅ **SIN título grande** - comienza directo con filtros y posts
- ✅ Metadata: "Blog - Nomadigma"
- ℹ️ Puedes agregar título opcional si quieres

### `/blog/[slug]`
- ✅ Muestra título del post
- ✅ Metadata dinámica con el título del post

### `/destinations`
- ✅ **SIN título grande** - comienza directo con búsqueda y mapa
- ✅ Metadata: "Destinations - Nomadigma"
- ℹ️ Puedes agregar título opcional si quieres

---

## 💡 Recomendaciones

1. **Páginas de contenido** (blog, destinations): 
   - ✅ NO necesitan título grande
   - El contenido habla por sí mismo
   - Más espacio para el contenido real

2. **Páginas estáticas** (about, services):
   - ✅ SÍ pueden tener título
   - Ayuda a orientar al usuario

3. **SEO**:
   - ✅ SIEMPRE configura metadata con título y descripción
   - Importante para Google y redes sociales

---

## 🚀 Para Agregar Nueva Página con Título

```typescript
// app/(pages)/nueva-pagina/page.tsx
import { Metadata } from 'next';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Título para el Navegador',
  description: 'Descripción para SEO',
};

export default function NuevaPagina() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          
          {/* Título opcional - solo si lo necesitas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">
              Tu Título Aquí
            </h1>
            <p className="text-xl text-muted-foreground">
              Descripción corta
            </p>
          </motion.div>

          {/* Contenido de la página */}
          
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
```

---

¡Ahora cada página es flexible y puedes personalizar según necesites! 🎨

