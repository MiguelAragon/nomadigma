'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useUserContext } from '@/providers/auth-provider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { SafeHtmlContent } from '@/components/editor/safe-html-content';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { 
  Save, 
  Send, 
  X,
  Loader2,
  Eye,
  Edit,
  Calendar,
  Clock,
  Pencil,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import moment from 'moment';
import { PageLoader } from '@/components/page-loader';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

type EditorMode = 'edit' | 'preview';

interface PostFormData {
  // Campos en inglés
  titleEn: string;
  contentEn: string;
  descriptionEn: string;
  slugEn: string;
  
  // Campos en español
  titleEs: string;
  contentEs: string;
  descriptionEs: string;
  slugEs: string;
  
  // Metadata compartida
  readingTime: number; // Tiempo de lectura en minutos
  language: 'en' | 'es'; // Idioma principal del post
  hashtags: string[];
  coverImageFile: File | null; // Archivo de imagen en lugar de base64
  coverImagePreview: string | null; // Preview local para mostrar
  publishedAt: string | null;
  postId?: string; // ID del post si es edición
}

export default function BlogEditorPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { user: dbUser } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  
  const [mode, setMode] = useState<EditorMode>('edit');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>(locale as 'en' | 'es');
  const [loadingPost, setLoadingPost] = useState(false);

  // Función para calcular tiempo de lectura (contando palabras del texto sin HTML)
  const calculateReadingTime = (html: string): number => {
    if (!html) return 0;
    // Remover HTML tags y contar palabras
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(wordCount / 200); // 200 palabras por minuto
  };
  
  const [formData, setFormData] = useState<PostFormData>({
    titleEn: '',
    contentEn: '',
    descriptionEn: '',
    slugEn: '',
    titleEs: '',
    contentEs: '',
    descriptionEs: '',
    slugEs: '',
    readingTime: 0,
    language: locale as 'en' | 'es',
    hashtags: [],
    coverImageFile: null,
    coverImagePreview: null,
    publishedAt: null,
  });
  const [shouldTranslate, setShouldTranslate] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push(`/${locale}/login`);
    }
  }, [isLoaded, userId, router, locale]);

  const loadPost = useCallback(async (slug: string) => {
    setLoadingPost(true);
    try {
      console.log('Loading post with slug:', slug);
      const response = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}&forEdit=true`);
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (!response.ok || !result.success) {
        console.error('API Error:', result);
        throw new Error(result.message || 'Post not found');
      }
      
      // El formato de APIResponse es { success, message, data: { ... } }
      // Cuando forEdit=true, data contiene directamente el post completo
      const post = result.data;
      
      if (post && post.id) {
        setIsEditing(true);
        
        // Determinar qué idioma mostrar según el locale actual
        const displayLang = locale as 'en' | 'es';
        setCurrentLanguage(displayLang);
        
        console.log('Post loaded:', post);
        console.log('Display language:', displayLang);
        
        // Cargar TODOS los datos de ambos idiomas
        setFormData({
          titleEn: post.titleEn || '',
          contentEn: post.contentEn || '',
          descriptionEn: post.descriptionEn || '',
          slugEn: post.slugEn || '',
          titleEs: post.titleEs || '',
          contentEs: post.contentEs || '',
          descriptionEs: post.descriptionEs || '',
          slugEs: post.slugEs || '',
          readingTime: post.readingTime || 0,
          language: (post.language || displayLang) as 'en' | 'es',
          hashtags: post.hashtags || [],
          coverImageFile: null,
          coverImagePreview: post.coverImage || null,
          publishedAt: post.publishedAt || null,
          postId: post.id,
        });
      } else {
        console.error('Post data not found in response:', result);
        toast.error('Post data not found');
      }
    } catch (error: any) {
      console.error('Error loading post:', error);
      toast.error(error.message || t('common.messages.error'));
    } finally {
      setLoadingPost(false);
    }
  }, [locale, t]);

  // Cargar post si hay slug en la URL
  useEffect(() => {
    const slug = searchParams.get('slug');
    console.log('Editor useEffect - slug:', slug, 'isLoaded:', isLoaded, 'userId:', userId);
    if (slug && isLoaded && userId) {
      loadPost(slug);
    }
  }, [searchParams, isLoaded, userId, loadPost]);

  const switchLanguage = (lang: 'en' | 'es') => {
    // Solo cambiar el idioma actual, sin hacer request - todos los datos ya están cargados
    setCurrentLanguage(lang);
  };

  // Helpers para obtener valores del idioma actual
  const getCurrentTitle = () => currentLanguage === 'en' ? formData.titleEn : formData.titleEs;
  const getCurrentContent = () => currentLanguage === 'en' ? formData.contentEn : formData.contentEs;
  const getCurrentDescription = () => currentLanguage === 'en' ? formData.descriptionEn : formData.descriptionEs;
  const getCurrentSlug = () => currentLanguage === 'en' ? formData.slugEn : formData.slugEs;

  // Generar slug automáticamente desde el título
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales excepto espacios y guiones
      .replace(/\s+/g, '-') // Reemplazar espacios por guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones por uno solo
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  };

  const handleTitleChange = (value: string) => {
    // Si el slug no está siendo editado manualmente, generarlo automáticamente
    if (!isSlugEditable) {
      const newSlug = generateSlug(value);
      if (currentLanguage === 'en') {
      setFormData(prev => ({
        ...prev,
          titleEn: value,
          slugEn: newSlug,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
          titleEs: value,
          slugEs: newSlug,
        }));
      }
    } else {
      if (currentLanguage === 'en') {
        setFormData(prev => ({ ...prev, titleEn: value }));
      } else {
        setFormData(prev => ({ ...prev, titleEs: value }));
      }
    }
  };

  const handleSlugChange = (value: string) => {
    // Sanitizar el slug mientras se edita manualmente
    const sanitized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (currentLanguage === 'en') {
      setFormData(prev => ({ ...prev, slugEn: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, slugEs: sanitized }));
    }
  };

  const handleAddHashtag = () => {
    // Remover # y espacios, capitalizar primera letra
    const cleaned = hashtagInput.trim().replace('#', '').replace(/\s+/g, '');
    if (cleaned) {
      // Capitalizar primera letra, resto en minúsculas
      const tag = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    if (tag && !formData.hashtags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag],
      }));
      setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag),
    }));
  };

  const translateContent = async (sourceLocale: string, targetLocale: string) => {
    setTranslating(true);
    try {
      const sourceTitle = sourceLocale === 'en' ? formData.titleEn : formData.titleEs;
      const sourceDescription = sourceLocale === 'en' ? formData.descriptionEn : formData.descriptionEs;
      const sourceContent = sourceLocale === 'en' ? formData.contentEn : formData.contentEs;
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceTitle,
          description: sourceDescription,
          content: sourceContent,
          from: sourceLocale,
          to: targetLocale,
        }),
      });

      if (!response.ok) {
        throw new Error(t('common.messages.error'));
      }

      const translated = await response.json();
      return translated;
    } catch (error: any) {
      console.error('Error translating:', error);
      toast.error(t('common.messages.error'));
      throw error;
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (publish: boolean = false) => {

    setLoading(true);

    try {
      // Preparar FormData para enviar - enviar TODOS los campos de ambos idiomas
      const formDataToSend = new FormData();
      
      // Campos en inglés
      formDataToSend.append('titleEn', formData.titleEn);
      formDataToSend.append('contentEn', formData.contentEn);
      formDataToSend.append('descriptionEn', formData.descriptionEn || '');
      formDataToSend.append('slugEn', formData.slugEn);
      
      // Campos en español
      formDataToSend.append('titleEs', formData.titleEs);
      formDataToSend.append('contentEs', formData.contentEs);
      formDataToSend.append('descriptionEs', formData.descriptionEs || '');
      formDataToSend.append('slugEs', formData.slugEs);
      
      // Metadata compartida
      formDataToSend.append('readingTime', formData.readingTime.toString());
      formDataToSend.append('language', formData.language);
      formDataToSend.append('hashtags', JSON.stringify(formData.hashtags));
      formDataToSend.append('status', publish ? 'PUBLISHED' : 'DRAFT');
      
      // Si es edición, agregar postId y translate
      if (isEditing && formData.postId) {
        formDataToSend.append('postId', formData.postId);
        formDataToSend.append('translate', shouldTranslate.toString());
      }
      
      // Agregar imagen si existe
      if (formData.coverImageFile) {
        formDataToSend.append('coverImage', formData.coverImageFile);
      }

      // Usar POST para crear o editar (el backend lo detecta por postId)
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('common.messages.error'));
      }

      const result = await response.json();
      
      toast.success(
        publish 
          ? t('common.messages.success')
          : t('common.messages.success')
      );
      
      // Redirigir a la página de edición con el slug del idioma actual
      if (result.data) {
        const slug = locale === 'en' ? result.data.slugEn : result.data.slugEs;
        if (slug) {
          router.push(`/${locale}/blog/editor?slug=${slug}`);
        } else {
          router.push(`/${locale}/blog`);
        }
      } else {
        router.push(`/${locale}/blog`);
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(error.message || t('common.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loadingPost) {
    return <PageLoader isLoading={true} />;
  }

  if (!userId) {
    return null; // El useEffect redirigirá
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              {/* Botones de idioma cuando es edición */}
              {isEditing && (
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => switchLanguage('en')}
                    disabled={loadingPost}
                    className={`h-8 px-4 transition-all font-medium ${
                      currentLanguage === 'en' 
                        ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                    }`}
                  >
                    EN
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => switchLanguage('es')}
                    disabled={loadingPost}
                    className={`h-8 px-4 transition-all font-medium ${
                      currentLanguage === 'es' 
                        ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                    }`}
                  >
                    ES
                </Button>
                </div>
              )}
              
              {/* Toggle Editor/Preview - Botón unificado */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('edit')}
                  className={`h-8 px-3 transition-all font-medium ${
                    mode === 'edit' 
                      ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                  }`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('blog.editor.edit_mode')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('preview')}
                  className={`h-8 px-3 transition-all font-medium ${
                    mode === 'preview' 
                      ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                  }`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('blog.editor.preview')}
                </Button>
              </div>
            </div>
          </motion.div>

          {mode === 'edit' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
              <div className="space-y-8">
                {/* Slug - Arriba del título, alineado a la derecha */}
                <div className="flex justify-end mb-2">
                  <div className="flex items-center gap-2">
                    {isSlugEditable ? (
                      <Input
                        id="slug"
                        value={getCurrentSlug()}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        onBlur={() => setIsSlugEditable(false)}
                        placeholder={locale === 'es' ? "como-viajar-a-japon" : "how-to-travel-to-japan"}
                        className="text-sm text-muted-foreground border-0 bg-transparent px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          /{locale}/blog/{getCurrentSlug() || 'slug'}
                        </span>
                        {getCurrentSlug() && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSlugEditable(true)}
                            className="h-6 w-6 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Título - Estilo como en el blog con padding correcto */}
                  <Input
                    id="title"
                    value={getCurrentTitle()}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={locale === 'es' ? "Título del post" : "Post Title"}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight border-0 bg-transparent px-0 h-auto min-h-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 mb-1"
                    required
                  />

                {/* Descripción - Después del slug, mismo estilo que el post */}
                <div className="mb-6">
                  <Textarea
                    id="description"
                    value={getCurrentDescription()}
                    onChange={(e) => {
                      if (currentLanguage === 'en') {
                        setFormData(prev => ({ ...prev, descriptionEn: e.target.value }));
                      } else {
                        setFormData(prev => ({ ...prev, descriptionEs: e.target.value }));
                      }
                    }}
                    placeholder={t('blog.editor.description_label')}
                    className="!text-2xl !md:text-2xl font-normal text-muted-foreground leading-relaxed border-0 bg-transparent px-0 py-3 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                    style={{ fontSize: '1.5rem', lineHeight: '1.5rem' }}
                    rows={2}
                  />
                </div>

                {/* Fecha y Reading Time - Arriba, después de título y descripción */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {moment().format('MMMM DD, YYYY')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <Input
                      id="readingTime"
                      type="number"
                      min="1"
                      value={formData.readingTime || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        readingTime: parseInt(e.target.value) || 0 
                      }))}
                      placeholder={calculateReadingTime(getCurrentContent()).toString()}
                      className="w-16 h-7 text-sm px-2 text-center bg-background border-border"
                      required
                    />
                    <span>min</span>
                  </div>
                </div>

                {/* Cover Image - Entre avatar y contenido */}
                <div className="mb-8">
                  <input
                    type="file"
                    id="cover-image-input"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Crear preview local
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string;
                          setFormData(prev => ({
                            ...prev,
                            coverImageFile: file,
                            coverImagePreview: imageUrl,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="cover-image-input">
                    <div className="bg-muted rounded-lg cursor-pointer overflow-hidden relative group h-64">
                      {formData.coverImagePreview ? (
                        <>
                          <img
                            src={formData.coverImagePreview}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay en hover */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-center">
                            <ImageIcon className="h-12 w-12 text-white" />
                            <span className="text-sm font-medium text-white">
                              {t('blog.editor.cover_image')}
                            </span>
                            <span className="text-xs text-white/80">
                              {t('blog.editor.cover_image_placeholder')}
                            </span>
                          </div>
                          {/* Botón eliminar - solo en hover */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData(prev => ({
                                ...prev,
                                coverImageFile: null,
                                coverImagePreview: null,
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-center h-full">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {t('blog.editor.cover_image')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t('blog.editor.cover_image_placeholder')}
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Contenido */}
                <div className="mb-8">
                  <RichTextEditor
                    content={getCurrentContent()}
                    onChange={(html) => {
                      if (currentLanguage === 'en') {
                        setFormData(prev => ({ ...prev, contentEn: html }));
                      } else {
                        setFormData(prev => ({ ...prev, contentEs: html }));
                      }
                    }}
                    placeholder={locale === 'es' 
                      ? "Escribe tu contenido aquí..." 
                      : "Write your content here..."}
                  />
                </div>

                {/* Hashtags y Author Info - Al final */}
                <div className="pt-8 border-t border-border/50">
                  {/* Hashtags */}
                  <div className="mb-6">
                    <div className="flex gap-2 items-center">
                      <Input
                        id="hashtags"
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddHashtag();
                          }
                        }}
                        placeholder={t('blog.editor.add_hashtag_placeholder')}
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddHashtag}
                      >
                        {t('blog.editor.add_hashtag')}
                      </Button>
                    </div>
                    {formData.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleRemoveHashtag(tag)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Author Info - Mismo diseño que blog/[slug] */}
                  <div className="flex items-center gap-4">
                    {(dbUser?.imageUrl || user?.imageUrl) ? (
                      <img
                        src={dbUser?.imageUrl || user?.imageUrl || ''}
                        alt={dbUser?.firstName || user?.firstName || 'User'}
                        className="size-20 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="size-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                        {((dbUser?.firstName?.[0] || user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase())}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {locale === 'es' ? 'El Autor' : 'The Author'}
                      </p>
                      <h3 className="font-bold text-xl">
                        {dbUser?.firstName && dbUser?.lastName 
                          ? `${dbUser.firstName} ${dbUser.lastName}`
                          : dbUser?.firstName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'Anonymous'}
                      </h3>
                      {dbUser?.bio && (
                        <p className="text-foreground text-lg leading-relaxed font-medium">
                          {dbUser.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkbox de traducción cuando se edita */}
                {isEditing && (
                  <div className="flex items-center gap-3 pt-4 border-t pb-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={shouldTranslate}
                          onChange={(e) => setShouldTranslate(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 bg-background peer-checked:bg-foreground peer-checked:border-foreground transition-all flex items-center justify-center group-hover:border-foreground/50">
                          {shouldTranslate && (
                            <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                        {formData.language === 'en' 
                          ? t('blog.editor.translate_to_spanish') || 'Traducir al español'
                          : t('blog.editor.translate_to_english') || 'Traducir al inglés'}
                      </span>
                    </label>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end pt-4 border-t">
                  <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={loading || translating}
                  >
                    {loading || translating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {translating 
                      ? t('common.messages.loading')
                      : t('blog.editor.publish')
                    }
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Preview Mode - Usando componente compartido */
            <BlogPostView
              title={getCurrentTitle() || t('blog.preview.no_title')}
              description={getCurrentDescription() || undefined}
              content={getCurrentContent()}
              coverImage={formData.coverImagePreview || undefined}
              date={new Date().toISOString()}
              readingTime={formData.readingTime || calculateReadingTime(getCurrentContent())}
              hashtags={formData.hashtags}
              author={{
                name: dbUser?.firstName && dbUser?.lastName 
                  ? `${dbUser.firstName} ${dbUser.lastName}`
                  : dbUser?.firstName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'Anonymous',
                avatar: dbUser?.imageUrl || user?.imageUrl || undefined,
                bio: dbUser?.bio || undefined,
              }}
              slug={getCurrentSlug() || undefined}
              locale={locale}
              animate={true}
            />
          )}
        </div>
      </div>

    </div>
  );
}

