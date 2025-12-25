import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza HTML para prevenir XSS attacks
 * Permite solo etiquetas HTML seguras para contenido de blog
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'video',
      'div', 'span', 'hr', 'iframe'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id',
      'width', 'height', 'target', 'rel', 'style',
      'controls', 'autoplay', 'loop', 'muted', 'playsinline', 'poster',
      'frameborder', 'allow', 'allowfullscreen', 'data-float'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Permitir estilos inline de forma segura (DOMPurify los sanitiza automáticamente)
    ALLOW_DATA_ATTR: true,
    // Remover scripts y eventos peligrosos (pero permitir iframe)
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Permitir estilos inline pero solo propiedades seguras
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Configuración adicional para iframes seguros
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['frameborder', 'allowfullscreen', 'allow'],
  });
}

/**
 * Sanitiza HTML antes de guardar en la base de datos
 */
export function sanitizeForStorage(html: string): string {
  return sanitizeHtml(html);
}

/**
 * Sanitiza HTML antes de renderizar en el frontend
 */
export function sanitizeForDisplay(html: string): string {
  return sanitizeHtml(html);
}

