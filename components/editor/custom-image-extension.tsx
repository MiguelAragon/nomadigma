import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Editor } from '@tiptap/react';

export interface ImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      setCustomImage: (options: { src: string; alt?: string }) => ReturnType;
    };
  }
}

// Componente React para el NodeView
function ImageNodeView({ node, updateAttributes, deleteNode, selected, editor }: {
  node: ProseMirrorNode;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: Editor;
}) {
  const { src, alt, width, float } = node.attrs;

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = parseInt(width) || 400;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, Math.min(1200, startWidth + deltaX));
      updateAttributes({ width: `${newWidth}px` });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Clases según el float
  let containerClass = 'image-container-wrapper';
  if (float === 'left') {
    containerClass += ' float-left';
  } else if (float === 'right') {
    containerClass += ' float-right';
  } else if (float === 'center') {
    containerClass += ' mx-auto block';
  } else {
    containerClass += ' block';
  }

  return (
    <NodeViewWrapper 
      className={containerClass}
      style={{ 
        width: float === 'center' || !float ? width || '400px' : width || '400px',
        maxWidth: '100%',
        margin: float === 'left' ? '0 1rem 1rem 0' : float === 'right' ? '0 0 1rem 1rem' : float === 'center' ? '1rem auto' : '1rem 0'
      }}
      data-float={float || ''}
      data-drag-handle=""
    >
      <div className={`image-container relative ${selected ? 'ring-2 ring-primary rounded-lg' : ''}`}>
        <img
          src={src}
          alt={alt || ''}
          className="w-full h-auto rounded-lg block"
          draggable={false}
        />
        {alt && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            {alt}
          </p>
        )}
        {selected && (
          <div
            className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize bg-primary/20 hover:bg-primary/50 flex items-center justify-center group transition-colors"
            onMouseDown={handleResize}
          >
            <div className="w-0.5 h-8 bg-primary rounded" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const CustomImage = Node.create<ImageOptions>({
  name: 'customImage',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: false,
  group: 'block',
  draggable: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: '400px',
      },
      float: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.image-container-wrapper',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLElement;
          const img = el.querySelector('img');
          const caption = el.querySelector('p.image-caption');
          const width = el.style.width || '400px';
          const float = el.getAttribute('data-float') || null;
          return {
            src: img?.getAttribute('src'),
            alt: caption?.textContent || img?.getAttribute('alt') || null,
            width,
            float,
          };
        },
      },
      {
        tag: 'div.image-container',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLElement;
          const wrapper = el.closest('.image-container-wrapper') as HTMLElement;
          const img = el.querySelector('img');
          const caption = el.querySelector('p.image-caption');
          const width = wrapper?.style.width || '400px';
          const float = wrapper?.getAttribute('data-float') || null;
          return {
            src: img?.getAttribute('src'),
            alt: caption?.textContent || img?.getAttribute('alt') || null,
            width,
            float,
          };
        },
      },
      {
        tag: 'img',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLImageElement;
          return {
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt') || null,
            width: '400px',
            float: null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, width, float } = HTMLAttributes;
    const children: any[] = [
      ['img', { src, alt: alt || '', class: 'w-full h-auto rounded-lg block' }],
    ];
    
    if (alt) {
      children.push(['p', { class: 'image-caption text-sm text-muted-foreground text-center mt-2' }, alt]);
    }

    let containerClass = 'image-container-wrapper';
    let marginStyle = '';
    
    if (float === 'left') {
      containerClass += ' float-left';
      marginStyle = 'margin: 0 1rem 1rem 0;';
    } else if (float === 'right') {
      containerClass += ' float-right';
      marginStyle = 'margin: 0 0 1rem 1rem;';
    } else if (float === 'center') {
      containerClass += ' mx-auto';
      marginStyle = 'margin: 1rem auto;';
    } else {
      marginStyle = 'margin: 1rem 0;';
    }

    return [
      'div',
      {
        class: containerClass,
        style: `width: ${width || '400px'}; max-width: 100%; ${marginStyle}`,
        'data-float': float || '',
      },
      ['div', { class: 'image-container' }, ...children],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addCommands() {
    return {
      setCustomImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src] = match;
          return { src, alt };
        },
      }),
    ];
  },
});

