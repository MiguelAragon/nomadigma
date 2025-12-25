# Editor de Contenido Rico

Este directorio contiene los componentes para editar y renderizar contenido HTML de forma segura.

## Componentes

### `RichTextEditor`
Editor WYSIWYG basado en TipTap para crear y editar contenido HTML.

**Props:**
- `content: string` - Contenido HTML inicial
- `onChange: (html: string) => void` - Callback cuando el contenido cambia
- `placeholder?: string` - Texto placeholder
- `editable?: boolean` - Si el editor es editable (default: true)

**Ejemplo de uso:**
```tsx
import { RichTextEditor } from '@/components/editor/rich-text-editor';

function PostForm() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Escribe el contenido del post..."
    />
  );
}
```

### `SafeHtmlContent`
Componente para renderizar HTML sanitizado de forma segura.

**Props:**
- `content: string` - Contenido HTML a renderizar
- `className?: string` - Clases CSS adicionales

**Ejemplo de uso:**
```tsx
import { SafeHtmlContent } from '@/components/editor/safe-html-content';

function PostView({ post }) {
  return (
    <SafeHtmlContent 
      content={post.contentEn}
      className="p-8"
    />
  );
}
```

## Utilidades

### `sanitizeHtml()`
Sanitiza HTML para prevenir XSS attacks.

### `sanitizeForStorage()`
Sanitiza HTML antes de guardar en la base de datos.

### `sanitizeForDisplay()`
Sanitiza HTML antes de renderizar en el frontend.

## Flujo de trabajo

1. **Crear/Editar Post:**
   - Usar `RichTextEditor` para escribir contenido
   - El editor sanitiza automáticamente el HTML
   - Guardar el HTML sanitizado en la base de datos

2. **Mostrar Post:**
   - Obtener HTML de la base de datos
   - Usar `SafeHtmlContent` para renderizar
   - El componente sanitiza nuevamente antes de renderizar

## Seguridad

- ✅ DOMPurify previene XSS attacks
- ✅ Solo etiquetas HTML seguras permitidas
- ✅ Scripts y eventos removidos automáticamente
- ✅ Sanitización doble (al guardar y al renderizar)

## Estilos

Los estilos se aplican usando Tailwind Typography (prose) que ya está configurado en el proyecto. Los estilos se mantienen consistentes con el template.

