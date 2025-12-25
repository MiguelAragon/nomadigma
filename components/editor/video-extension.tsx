import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Editor } from '@tiptap/react';

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; caption?: string }) => ReturnType;
    };
  }
}

// Función para extraer ID de video de YouTube
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Componente React para el NodeView del video
function VideoNodeView({ node, updateAttributes, deleteNode, selected, editor }: {
  node: ProseMirrorNode;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
  selected: boolean;
  editor: Editor;
}) {
  const { src, caption, width, float } = node.attrs;
  const videoId = getYouTubeId(src);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = parseInt(width) || 560;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(1200, startWidth + deltaX));
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
  let containerClass = 'video-container-wrapper';
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
        width: float === 'center' || !float ? width || '560px' : width || '560px',
        maxWidth: '100%',
        margin: float === 'left' ? '0 1rem 1rem 0' : float === 'right' ? '0 0 1rem 1rem' : float === 'center' ? '1rem auto' : '1rem 0'
      }}
      data-float={float || ''}
      data-drag-handle=""
    >
      <div className={`video-container relative ${selected ? 'ring-2 ring-primary rounded-lg' : ''}`}>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full rounded-lg"
            style={{ aspectRatio: '16/9' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={src}
            controls
            className="w-full h-auto rounded-lg block"
          />
        )}
        {caption && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            {caption}
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

export const Video = Node.create<VideoOptions>({
  name: 'video',

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
      caption: {
        default: null,
      },
      width: {
        default: '560px',
      },
      float: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.video-container-wrapper',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLElement;
          const iframe = el.querySelector('iframe');
          const video = el.querySelector('video');
          const caption = el.querySelector('p.video-caption');
          const width = el.style.width || '560px';
          const float = el.getAttribute('data-float') || null;
          
          let src = '';
          if (iframe) {
            const iframeSrc = iframe.getAttribute('src') || '';
            const match = iframeSrc.match(/embed\/([^?]+)/);
            src = match ? `https://www.youtube.com/watch?v=${match[1]}` : iframeSrc;
          } else if (video) {
            src = video.getAttribute('src') || '';
          }
          
          return {
            src,
            caption: caption?.textContent || null,
            width,
            float,
          };
        },
      },
      {
        tag: 'div.video-container',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLElement;
          const wrapper = el.closest('.video-container-wrapper') as HTMLElement;
          const iframe = el.querySelector('iframe');
          const video = el.querySelector('video');
          const caption = el.querySelector('p.video-caption');
          const width = wrapper?.style.width || '560px';
          const float = wrapper?.getAttribute('data-float') || null;
          
          let src = '';
          if (iframe) {
            const iframeSrc = iframe.getAttribute('src') || '';
            const match = iframeSrc.match(/embed\/([^?]+)/);
            src = match ? `https://www.youtube.com/watch?v=${match[1]}` : iframeSrc;
          } else if (video) {
            src = video.getAttribute('src') || '';
          }
          
          return {
            src,
            caption: caption?.textContent || null,
            width,
            float,
          };
        },
      },
      {
        tag: 'video',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const el = node as HTMLVideoElement;
          return {
            src: el.getAttribute('src'),
            caption: null,
            width: '560px',
            float: null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, caption, width, float } = HTMLAttributes;
    const videoId = getYouTubeId(src);
    
    const videoElement = videoId 
      ? ['iframe', {
          src: `https://www.youtube.com/embed/${videoId}`,
          class: 'w-full rounded-lg',
          style: 'aspect-ratio: 16/9;',
          frameborder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
        }]
      : ['video', { src, controls: 'true', class: 'w-full h-auto rounded-lg block' }];
    
    const children: any[] = [videoElement];
    
    if (caption) {
      children.push(['p', { class: 'video-caption text-sm text-muted-foreground text-center mt-2' }, caption]);
    }

    let containerClass = 'video-container-wrapper';
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
        style: `width: ${width || '560px'}; max-width: 100%; ${marginStyle}`,
        'data-float': float || '',
      },
      ['div', { class: 'video-container' }, ...children],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
