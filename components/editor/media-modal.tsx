'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Video, Upload, Link as LinkIcon, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface MediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (src: string, alt?: string, file?: File) => void;
  onInsertVideo: (src: string) => void;
  type: 'image' | 'video';
}

export function MediaModal({ 
  open, 
  onOpenChange, 
  onInsertImage, 
  onInsertVideo,
  type 
}: MediaModalProps) {
  const { locale } = useTranslation();
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = type === 'image';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleInsert = () => {
    if (isImage) {
      if (uploadedFile) {
        // Si hay un archivo subido, usar ese
        const reader = new FileReader();
        reader.onloadend = () => {
          onInsertImage(reader.result as string, imageAlt || undefined, uploadedFile);
          handleClose();
        };
        reader.readAsDataURL(uploadedFile);
      } else if (imageUrl) {
        // Si hay una URL, usar esa
        onInsertImage(imageUrl, imageAlt || undefined);
        handleClose();
      }
    } else {
      if (videoUrl) {
        onInsertVideo(videoUrl);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setVideoUrl('');
    setImageAlt('');
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const canInsert = isImage 
    ? (uploadedFile || imageUrl.trim() !== '')
    : videoUrl.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isImage ? (
              <>
                <ImageIcon className="h-5 w-5" />
                {locale === 'es' ? 'Agregar Imagen' : 'Add Image'}
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                {locale === 'es' ? 'Agregar Video' : 'Add Video'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isImage 
              ? (locale === 'es' 
                  ? 'Sube una imagen desde tu dispositivo o ingresa una URL'
                  : 'Upload an image from your device or enter a URL')
              : (locale === 'es'
                  ? 'Ingresa la URL del video (YouTube, Vimeo, etc.)'
                  : 'Enter the video URL (YouTube, Vimeo, etc.)')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isImage ? (
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  {locale === 'es' ? 'Subir' : 'Upload'}
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {locale === 'es' ? 'URL' : 'URL'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">
                    {locale === 'es' ? 'Seleccionar imagen' : 'Select image'}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                          onClick={() => {
                            setUploadedFile(null);
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Descripción/Alt text para imágenes */}
                <div className="space-y-2">
                  <Label htmlFor="image-alt-upload">
                    {locale === 'es' ? 'Descripción (alt text)' : 'Description (alt text)'}
                  </Label>
                  <Input
                    id="image-alt-upload"
                    type="text"
                    placeholder={locale === 'es' ? 'Describe la imagen...' : 'Describe the image...'}
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'es' 
                      ? 'Esta descripción ayuda a la accesibilidad y SEO'
                      : 'This description helps with accessibility and SEO'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">
                    {locale === 'es' ? 'URL de la imagen' : 'Image URL'}
                  </Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder={locale === 'es' ? 'https://ejemplo.com/imagen.jpg' : 'https://example.com/image.jpg'}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-4 relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Descripción/Alt text para imágenes */}
                <div className="space-y-2">
                  <Label htmlFor="image-alt-url">
                    {locale === 'es' ? 'Descripción (alt text)' : 'Description (alt text)'}
                  </Label>
                  <Input
                    id="image-alt-url"
                    type="text"
                    placeholder={locale === 'es' ? 'Describe la imagen...' : 'Describe the image...'}
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === 'es' 
                      ? 'Esta descripción ayuda a la accesibilidad y SEO'
                      : 'This description helps with accessibility and SEO'
                    }
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">
                  {locale === 'es' ? 'URL del video' : 'Video URL'}
                </Label>
                <Input
                  id="video-url"
                  type="url"
                  placeholder={locale === 'es' ? 'https://youtube.com/watch?v=... o https://vimeo.com/...' : 'https://youtube.com/watch?v=... or https://vimeo.com/...'}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {locale === 'es' 
                    ? 'Soporta YouTube, Vimeo y otros servicios de video'
                    : 'Supports YouTube, Vimeo and other video services'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {locale === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!canInsert}>
            {locale === 'es' ? 'Insertar' : 'Insert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

