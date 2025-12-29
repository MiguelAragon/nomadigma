'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from '@/hooks/use-api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import moment from 'moment';
import { useTranslation } from '@/hooks/use-translation';

interface Gallery {
  id: string;
  titleEn: string;
  titleEs: string;
  url: string;
  urlThumbnail: string | null;
  status: 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  creator: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminGalleryPage() {
  const { apiCall } = useApiClient();
  const { locale } = useTranslation();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingGalleryId, setUpdatingGalleryId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>(locale as 'en' | 'es');
  const [formData, setFormData] = useState({
    titleEn: '',
    titleEs: '',
    contentEn: '',
    contentEs: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGalleries(pagination.page);
  }, []);

  const fetchGalleries = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    const result = await apiCall(`/api/admin/gallery?page=${page}&limit=${pagination.limit}`);
    
    if (result.success && result.data) {
      setGalleries(result.data.galleries);
      setPagination(result.data.pagination);
    } else {
      setError('Error al cargar galerías');
    }
    
    setIsLoading(false);
  };

  const handleStatusChange = async (galleryId: string, newStatus: 'PUBLISHED' | 'ARCHIVED') => {
    setUpdatingGalleryId(galleryId);
    
    const result = await apiCall('/api/admin/gallery', {
      method: 'PATCH',
      body: JSON.stringify({ galleryId, status: newStatus }),
    });

    if (result.success) {
      setGalleries(galleries.map(g => g.id === galleryId ? { ...g, status: newStatus } : g));
    }
    
    setUpdatingGalleryId(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchGalleries(newPage);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('El archivo debe ser una imagen');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande. Máximo 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const currentTitle = getCurrentTitle();
    const currentContent = getCurrentContent();
    
    if (!currentTitle || !currentContent) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    if (!formData.imageFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      // Solo enviar los campos del idioma activo
      if (currentLanguage === 'en') {
        formDataToSend.append('titleEn', currentTitle);
        formDataToSend.append('contentEn', currentContent);
      } else {
        formDataToSend.append('titleEs', currentTitle);
        formDataToSend.append('contentEs', currentContent);
      }
      formDataToSend.append('language', currentLanguage);
      formDataToSend.append('image', formData.imageFile);

      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Error al crear la galería');
        return;
      }

      toast.success('Galería creada correctamente');
      setIsModalOpen(false);
      setFormData({
        titleEn: '',
        titleEs: '',
        contentEn: '',
        contentEs: '',
        imageFile: null,
        imagePreview: null,
      });
      fetchGalleries(pagination.page);
    } catch (error) {
      console.error('Error creating gallery:', error);
      toast.error('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentTitle = () => currentLanguage === 'en' ? formData.titleEn : formData.titleEs;
  const getCurrentContent = () => currentLanguage === 'en' ? formData.contentEn : formData.contentEs;

  const handleTitleChange = (value: string) => {
    if (currentLanguage === 'en') {
      setFormData(prev => ({ ...prev, titleEn: value }));
    } else {
      setFormData(prev => ({ ...prev, titleEs: value }));
    }
  };

  const handleContentChange = (value: string) => {
    if (currentLanguage === 'en') {
      setFormData(prev => ({ ...prev, contentEn: value }));
    } else {
      setFormData(prev => ({ ...prev, contentEs: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Galería</h1>
          <p className="text-muted-foreground">Administra el estado de las galerías</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="size-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Subir Nueva Imagen a la Galería</DialogTitle>
              <DialogDescription>
                Completa los campos en inglés y español para agregar una nueva imagen a la galería
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentLanguage('en')}
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
                  onClick={() => setCurrentLanguage('es')}
                  className={`h-8 px-4 transition-all font-medium ${
                    currentLanguage === 'es' 
                      ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                  }`}
                >
                  ES
                </Button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {currentLanguage === 'en' ? 'Title' : 'Título'}
                </Label>
                <Input
                  id="title"
                  value={getCurrentTitle()}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={currentLanguage === 'en' ? 'Write the title...' : 'Escribe el título...'}
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  {currentLanguage === 'en' ? 'Content' : 'Contenido'}
                </Label>
                <Textarea
                  id="content"
                  value={getCurrentContent()}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={currentLanguage === 'en' ? 'Write the content...' : 'Escribe el contenido...'}
                  rows={6}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">{currentLanguage === 'en' ? 'Image' : 'Imagen'}</Label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="image">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                    {formData.imagePreview ? (
                      <div className="relative">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              imageFile: null,
                              imagePreview: null,
                            }));
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <ImageIcon className="size-12 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {currentLanguage === 'en' ? 'Click to upload an image' : 'Haz clic para subir una imagen'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {currentLanguage === 'en' ? 'PNG, JPG, GIF up to 10MB' : 'PNG, JPG, GIF hasta 10MB'}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  {currentLanguage === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (currentLanguage === 'en' ? 'Uploading...' : 'Subiendo...') : (currentLanguage === 'en' ? 'Upload Image' : 'Subir Imagen')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {galleries.map((gallery) => (
              <tr key={gallery.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={gallery.urlThumbnail || gallery.url}
                    alt={gallery.titleEs}
                    className="h-12 w-12 rounded object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {moment(gallery.createdAt).format('DD/MM/YYYY')}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {gallery.titleEs}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {gallery.titleEn}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {gallery.creator.firstName} {gallery.creator.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={gallery.status}
                    onChange={(e) => handleStatusChange(gallery.id, e.target.value as 'PUBLISHED' | 'ARCHIVED')}
                    disabled={updatingGalleryId === gallery.id}
                    className="px-3 py-1 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: gallery.status === 'PUBLISHED' ? '#dcfce7' : '#fee2e2',
                      color: gallery.status === 'PUBLISHED' ? '#16a34a' : '#dc2626',
                      borderColor: gallery.status === 'PUBLISHED' ? '#bbf7d0' : '#fecaca',
                    }}
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || isLoading}
          variant="outline"
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Página {pagination.page} de {pagination.totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages || isLoading}
          variant="outline"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

