'use client';

import { sanitizeForDisplay } from '@/lib/sanitize-html';
import { cn } from '@/lib/utils';
import { useEffect, useState, memo } from 'react';

interface SafeHtmlContentProps {
  content: string;
  className?: string;
}

/**
 * Componente seguro para renderizar HTML sanitizado
 * Usa DOMPurify para prevenir XSS attacks
 */
const SafeHtmlContentComponent = ({ content, className }: SafeHtmlContentProps) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    if (content && typeof content === 'string') {
      try {
        const sanitized = sanitizeForDisplay(content);
        // Debug removido - ya no necesario
        setSanitizedContent(sanitized);
      } catch (error) {
        console.error('Error sanitizing content:', error);
        setSanitizedContent('');
      }
    } else {
      setSanitizedContent('');
    }
  }, [content]);

  // Mostrar contenido incluso si está vacío para debug
  if (!content) {
    return null;
  }

  // Si no hay contenido sanitizado pero sí hay contenido original, mostrar el original
  if (!sanitizedContent && content) {
    return (
      <div className="text-muted-foreground italic">
        Contenido vacío después de sanitización
      </div>
    );
  }

  return (
    <div
      className={cn(
        'tiptap-editor-content', // Usar la misma clase que el editor
        'w-full break-words',
        className
      )}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export const SafeHtmlContent = memo(SafeHtmlContentComponent);

