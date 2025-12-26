'use client';

import { useState, useEffect, memo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// @ts-ignore - BubbleMenu is exported from a subpath export
import { BubbleMenu } from '@tiptap/react/menus';
import { NodeSelection } from 'prosemirror-state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1, 
  List, 
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Undo,
  Redo,
  Edit,
  AlignLeft,
  AlignRight,
  Maximize
} from 'lucide-react';
import { MediaModal } from './media-modal';
import { EditImageModal } from './edit-image-modal';
import { CustomImage } from './custom-image-extension';
import { Video as VideoExtension } from './video-extension';
import { useTranslation } from '@/hooks/use-translation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

const RichTextEditorComponent = ({ 
  content, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  editable = true 
}: RichTextEditorProps) => {
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [editImageModalOpen, setEditImageModalOpen] = useState(false);
  const [currentImageAlt, setCurrentImageAlt] = useState('');
  const [editVideoModalOpen, setEditVideoModalOpen] = useState(false);
  const [currentVideoCaption, setCurrentVideoCaption] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1],
        },
        link: false,
      }),
      CustomImage,
      VideoExtension.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
          controls: true,
          style: 'width: 100%;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'font-bold no-underline',
          style: 'color: #6747c7; text-decoration: none;',
        },
      }),
      UnderlineExtension,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none min-h-[300px] p-4',
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!mounted || !editor) {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background min-h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Cargando editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-background' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-background' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-background' : ''}
          >
            <Underline className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-background' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-background' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-background' : ''}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-background' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-background' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt('URL del enlace:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={editor.isActive('link') ? 'bg-background' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMediaType('image');
              setMediaModalOpen(true);
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMediaType('video');
              setMediaModalOpen(true);
            }}
          >
            <Video className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="tiptap-wrapper relative">
        <EditorContent editor={editor} />
        
        {/* BubbleMenu para texto */}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor: ed, state }: { editor: any; state: any }) => {
              const { selection } = state;
              if (selection instanceof NodeSelection) {
                return false;
              }
              const { from, to } = selection;
              return from !== to;
            }}
            className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg p-1"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'bg-muted' : ''}
            >
              <Underline className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'bg-muted' : ''}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            >
              <Quote className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt('URL del enlace:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={editor.isActive('link') ? 'bg-muted' : ''}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        )}

        {/* BubbleMenu para imágenes */}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor: ed, state }: { editor: any; state: any }) => {
              const { selection } = state;
              if (selection instanceof NodeSelection) {
                return selection.node.type.name === 'customImage';
              }
              return false;
            }}
            className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg p-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const attrs = editor.getAttributes('customImage');
                setCurrentImageAlt(attrs.alt || '');
                setEditImageModalOpen(true);
              }}
              title={locale === 'es' ? 'Editar descripción' : 'Edit description'}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().updateAttributes('customImage', { float: 'left' }).run();
              }}
              title={locale === 'es' ? 'Alinear a la izquierda' : 'Align left'}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().updateAttributes('customImage', { float: 'center' }).run();
              }}
              title={locale === 'es' ? 'Centrar' : 'Center'}
            >
              <Maximize className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().updateAttributes('customImage', { float: 'right' }).run();
              }}
              title={locale === 'es' ? 'Alinear a la derecha' : 'Align right'}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        )}

        {/* BubbleMenu para videos */}
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor: ed, state }: { editor: any; state: any }) => {
              const { selection } = state;
              if (selection instanceof NodeSelection) {
                return selection.node.type.name === 'video';
              }
              return false;
            }}
            className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg p-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const attrs = editor.getAttributes('video');
                setCurrentVideoCaption(attrs.caption || '');
                setEditVideoModalOpen(true);
              }}
              title={locale === 'es' ? 'Editar descripción' : 'Edit description'}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().updateAttributes('video', { float: 'left' }).run();
              }}
              title={locale === 'es' ? 'Alinear a la izquierda' : 'Align left'}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().updateAttributes('video', { float: 'center' }).run();
              }}
              title={locale === 'es' ? 'Centrar' : 'Center'}
            >
              <Maximize className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().updateAttributes('video', { float: 'right' }).run();
              }}
              title={locale === 'es' ? 'Alinear a la derecha' : 'Align right'}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        )}
      </div>

      {/* Media Modal */}
      <MediaModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        type={mediaType}
        onInsertImage={(src, alt, file) => {
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              editor.chain().focus().setCustomImage({ src: reader.result as string, alt: alt || '' }).run();
            };
            reader.readAsDataURL(file);
          } else {
            editor.chain().focus().setCustomImage({ src, alt: alt || '' }).run();
          }
        }}
        onInsertVideo={(src) => {
          editor.chain().focus().setVideo({ src }).run();
        }}
      />

      {/* Edit Image Modal */}
      <EditImageModal
        open={editImageModalOpen}
        onOpenChange={setEditImageModalOpen}
        currentAlt={currentImageAlt}
        onSave={(alt) => {
          editor.chain().focus().updateAttributes('customImage', { alt }).run();
        }}
      />

      {/* Edit Video Modal */}
      <Dialog open={editVideoModalOpen} onOpenChange={setEditVideoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {locale === 'es' ? 'Editar descripción del video' : 'Edit video description'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'es' 
                ? 'La descripción ayuda con la accesibilidad y SEO'
                : 'The description helps with accessibility and SEO'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-caption">
                {locale === 'es' ? 'Descripción' : 'Description'}
              </Label>
              <Input
                id="video-caption"
                type="text"
                placeholder={locale === 'es' ? 'Describe el video...' : 'Describe the video...'}
                value={currentVideoCaption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentVideoCaption(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    editor.chain().focus().updateAttributes('video', { caption: currentVideoCaption }).run();
                    setEditVideoModalOpen(false);
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditVideoModalOpen(false)}
            >
              {locale === 'es' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                editor.chain().focus().updateAttributes('video', { caption: currentVideoCaption }).run();
                setEditVideoModalOpen(false);
              }}
            >
              {locale === 'es' ? 'Guardar' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
export const RichTextEditor = memo(RichTextEditorComponent);
