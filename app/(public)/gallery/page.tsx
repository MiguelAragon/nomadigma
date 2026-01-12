'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Captions, Zoom } from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/plugins/captions.css';
import { Container } from '@/components/ui/container';

interface GalleryItem {
  id: string;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  url: string;
  urlThumbnail: string | null;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function GalleryPage() {
  const { locale, t } = useTranslation();
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [allGalleries, setAllGalleries] = useState<GalleryItem[]>([]); // Todas las imágenes cargadas para el lightbox
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    fetchGalleries(pagination.page, true);
  }, [locale]);

  const fetchGalleries = async (page: number, replace: boolean = false) => {
    if (replace) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await fetch(`/api/gallery?page=${page}&limit=${pagination.limit}&locale=${locale}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        if (replace) {
          setGalleries(result.data.galleries);
          setAllGalleries(result.data.galleries);
        } else {
          // Agregar nuevas imágenes sin duplicar
          setAllGalleries(prev => {
            const existingIds = new Set(prev.map(g => g.id));
            const newGalleries = result.data.galleries.filter((g: GalleryItem) => !existingIds.has(g.id));
            return [...prev, ...newGalleries];
          });
        }
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Cargar más imágenes cuando el usuario está cerca del final del lightbox
  const loadMoreIfNeeded = (currentIndex: number) => {
    const threshold = 3; // Cargar cuando falten 3 imágenes para el final
    const remainingImages = allGalleries.length - currentIndex;
    
    // Si estamos cerca del final y hay más páginas, cargar la siguiente
    if (remainingImages <= threshold && pagination.page < pagination.totalPages && !isLoadingMore) {
      fetchGalleries(pagination.page + 1, false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchGalleries(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    // Cargar más si es necesario al abrir
    loadMoreIfNeeded(index);
  };

  const handleLightboxIndexChange = (index: number) => {
    setLightboxIndex(index);
    loadMoreIfNeeded(index);
  };

  const getTitle = (item: GalleryItem) => locale === 'en' ? item.titleEn : item.titleEs;
  const getContent = (item: GalleryItem) => locale === 'en' ? item.contentEn : item.contentEs;

  // Preparar slides para el lightbox (usar allGalleries para tener todas las imágenes cargadas)
  const slides = allGalleries.map((gallery) => {
    const description = getContent(gallery);
    return {
      src: gallery.url,
      title: getTitle(gallery),
      description: description ? (
        <div 
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className={`cursor-pointer gallery-description ${
            isDescriptionExpanded ? 'max-h-[60vh] overflow-y-auto' : 'max-h-[100px] overflow-hidden'
          }`}
          style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6',
            textShadow: '0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          {description}
          {!isDescriptionExpanded && description.length > 150 && (
            <div className="mt-2 text-sm text-white/70">
              {locale === 'es' ? '(Click para ver más)' : '(Click to see more)'}
            </div>
          )}
        </div>
      ) : undefined,
    };
  });

  if (isLoading) {
    return (
      <Container className="bg-background min-h-screen pt-24 pb-20">
        <div className="text-center py-20">
          <div className="size-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </Container>
    );
  }

  if (galleries.length === 0) {
  return (
    <Container className="bg-background">
      <section className="pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-muted p-6">
                <Image className="size-12 text-muted-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {locale === 'es' ? 'Galería' : 'Gallery'}
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
                {locale === 'es' ? 'No hay fotos todavía' : 'No photos yet'}
            </p>
            <p className="text-muted-foreground">
                {locale === 'es' 
                  ? 'Próximamente podrás ver todas las fotos de nuestros viajes aquí.'
                  : 'Coming soon, you will be able to see all our travel photos here.'}
            </p>
          </motion.div>
      </section>
    </Container>
  );
}

  return (
    <Container className="bg-background min-h-screen">
      <section className="pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {locale === 'es' ? 'Galería de fotos' : 'Photos Gallery'}
            </h2>
          </motion.div>

          {/* Grid de imágenes estilo mosaico */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 mb-12">
            {galleries.map((gallery, index) => {
              // Patrón de mosaico: cada 7ma imagen es grande
              const isLarge = index % 7 === 0;
              const isTall = index % 11 === 0;
              const isWide = index % 13 === 0;
              
              return (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`group relative overflow-hidden rounded-lg bg-muted cursor-pointer
                    ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}
                    ${!isLarge && isTall ? 'row-span-2' : ''}
                    ${!isLarge && !isTall && isWide ? 'md:col-span-2' : ''}
                  `}
                onClick={() => openLightbox(index)}
              >
                {/* Imagen */}
                <img
                  src={gallery.urlThumbnail || gallery.url}
                  alt={getTitle(gallery)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                  {/* Overlay con título */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`p-4 md:p-6 text-left ${isLarge ? 'md:p-8' : ''}`}>
                      <div className={`font-medium text-white line-clamp-2 ${isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>
                      {getTitle(gallery)}
                    </div>
                      {isLarge && (
                        <div className="text-sm md:text-base text-white/80 line-clamp-2 mt-2">
                          {getContent(gallery)}
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                {locale === 'es' ? 'Anterior' : 'Previous'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {locale === 'es' 
                  ? `Página ${pagination.page} de ${pagination.totalPages}`
                  : `Page ${pagination.page} of ${pagination.totalPages}`}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                {locale === 'es' ? 'Siguiente' : 'Next'}
              </Button>
            </div>
          )}
      </section>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Captions, Zoom]}
        captions={{
          showToggle: false,
          descriptionTextAlign: 'start',
          descriptionMaxLines: isDescriptionExpanded ? undefined : 3,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
          captionsTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          },
          captionsDescription: {
            // Estilos manejados por el componente personalizado
          },
          captionsTitleContainer: {
            background: 'rgba(0,0,0,0.85)',
            padding: '1.5rem 1.5rem 0.75rem 1.5rem',
          },
          captionsDescriptionContainer: {
            background: 'rgba(0,0,0,0.85)',
            padding: '0.5rem 1.5rem 1.5rem 1.5rem',
          },
        }}
        on={{
          view: ({ index }) => {
            if (index !== undefined) {
              handleLightboxIndexChange(index);
              setIsDescriptionExpanded(false); // Resetear al cambiar de imagen
            }
          },
        }}
      />
    </Container>
  );
}
