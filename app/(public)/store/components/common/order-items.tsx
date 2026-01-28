'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/providers/i18n-provider';

interface OrderItem {
  id: string;
  title: string;
  logo: string;
  sku: string;
  quantity: number;
  total: string;
  label?: string;
  badge?: boolean;
  description?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  downloadFile?: string;
  productType?: 'PHYSICAL' | 'DIGITAL';
  selectedVariants?: Record<string, string>; // { [variantLabel]: variantValue }
  variantFiles?: any; // JSON con mapeo de valores a URLs
  productVariants?: any; // Array de variantes del producto
}

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  const { locale } = useLanguage();

  const renderItem = (item: OrderItem, index: number) => {
    const imageUrl = item.logo.startsWith('http') || item.logo.startsWith('/')
      ? item.logo
      : toAbsoluteUrl(`/media/store/client/600x600/${item.logo}`);

    const description = locale === 'es' 
      ? (item.descriptionEs || item.description || '')
      : (item.descriptionEn || item.description || '');

    // Limpiar HTML de la descripción
    const cleanDescription = description 
      ? description.replace(/<[^>]*>/g, '').substring(0, 200)
      : '';

    // Componente interno para manejar el estado de carga de imagen
    const ImageWithPlaceholder = () => {
      const [imageLoaded, setImageLoaded] = useState(false);
      const [imageError, setImageError] = useState(false);

      return (
        <Card className="relative bg-accent/50 h-[70px] w-[90px] shadow-none overflow-hidden shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer"></div>
          )}

          {!imageError && (
            <img
              src={imageUrl}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              alt={item.title}
            />
          )}

          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-muted-foreground text-xs">No image</div>
            </div>
          )}
        </Card>
      );
    };

    // Verificar si tiene documentos descargables
    const hasDownloadableFiles = item.productType === 'DIGITAL' && item.variantFiles && item.selectedVariants;
    
    return (
      <Card key={item.id || index} className="overflow-hidden hover:shadow-lg group">
        <Accordion type="single" collapsible className="w-full" defaultValue={hasDownloadableFiles ? `item-${index}` : undefined}>
          <AccordionItem value={`item-${index}`} className="border-none">
            <CardContent className="p-0">
              {/* Header clickeable para abrir/cerrar accordion */}
              <AccordionTrigger className="hover:no-underline [&>svg]:hidden group/trigger [&]:transition-none">
                <div className="flex items-center flex-wrap justify-between gap-4.5 w-full p-2 pe-5">
                  <div className="flex items-center gap-3.5">
                    <ImageWithPlaceholder />

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/store/products/${item.sku}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary text-sm font-medium text-mono leading-5.5 group-hover:text-primary transition-colors duration-300"
                        >
                          {item.title}
                        </Link>
                      </div>

                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {Object.entries(item.selectedVariants).map(([label, value]) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">{label}:</span>
                              <span className="text-xs text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <Badge size="sm" variant="destructive" className="uppercase">
                              save 25%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-normal text-secondary-foreground text-end">
                        {item.quantity}&nbsp;x
                      </span>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {item.label && (
                          <span className="text-sm font-normal text-secondary-foreground line-through">
                            {item.label}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-mono">
                          ${item.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              {/* Botones de descarga para productos digitales - Mostrar directamente sin accordion */}
              {item.productType === 'DIGITAL' && item.variantFiles && item.selectedVariants && (() => {
                // Obtener URLs de descarga basadas en las variaciones seleccionadas
                const downloadLinks: Array<{ url: string; label: string }> = [];
                
                try {
                  const variantFiles = Array.isArray(item.variantFiles)
                    ? item.variantFiles
                    : Object.entries(item.variantFiles || {}).map(([value, url]: [string, any]) => ({
                        values: [value],
                        type: 'url',
                        url: url
                      }));
                  
                  // Buscar archivos que coincidan con las variaciones seleccionadas
                  const selectedValues = Object.values(item.selectedVariants);
                  
                  variantFiles.forEach((vf: any) => {
                    if (vf.url && (vf.type === 'url' || vf.type === 'file')) {
                      // Si los valores de la variante coinciden con los seleccionados
                      const vfValues = Array.isArray(vf.values) ? vf.values : [];
                      const matches = vfValues.some((val: string) => selectedValues.includes(val));
                      
                      if (matches || vfValues.length === 0) {
                        const url = vf.url.startsWith('http') 
                          ? vf.url 
                          : toAbsoluteUrl(vf.url);
                        const label = vfValues.length > 0 
                          ? vfValues.join(', ') 
                          : (locale === 'es' ? 'Descargar' : 'Download');
                        downloadLinks.push({ url, label });
                      }
                    }
                  });
                } catch (error) {
                  console.error('Error processing variant files:', error);
                }
                
                if (downloadLinks.length > 0) {
                  return (
                    <div className="px-5 pb-4 pt-2 border-t border-border">
                      <h4 className="text-xs font-semibold text-foreground mb-2">
                        {locale === 'es' ? 'Archivos descargables' : 'Downloadable files'}
                      </h4>
                      <div className="space-y-2">
                        {downloadLinks.map((link, idx) => (
                          <Button 
                            key={idx}
                            variant="outline" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            asChild
                          >
                            <a 
                              href={link.url} 
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Download className="size-4" />
                              {locale === 'es' ? 'Descargar' : 'Download'} {downloadLinks.length > 1 ? `(${link.label})` : ''}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <AccordionContent className="px-5 pb-4 space-y-3 [&]:animate-none [&]:data-[state=closed]:animate-none [&]:data-[state=open]:animate-none">

                {cleanDescription && (
                  <div className={`pt-2 ${item.selectedVariants && Object.keys(item.selectedVariants).length > 0 ? 'border-t border-border' : ''}`}>
                    <h4 className="text-xs font-semibold text-foreground mb-2">
                      {locale === 'es' ? 'Descripción' : 'Description'}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cleanDescription}
                    </p>
                  </div>
                )}

                {/* Fallback para downloadFile antiguo */}
                {item.downloadFile && item.productType !== 'DIGITAL' && (
                  <div className={`pt-2 border-t border-border ${cleanDescription ? '' : ''}`}>
                    <h4 className="text-xs font-semibold text-foreground mb-2">
                      {locale === 'es' ? 'Archivo descargable' : 'Downloadable file'}
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      asChild
                    >
                      <a 
                        href={item.downloadFile} 
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="size-4" />
                        {locale === 'es' ? 'Descargar archivo' : 'Download file'}
                      </a>
                    </Button>
                  </div>
                )}

                {!cleanDescription && !item.downloadFile && (!item.selectedVariants || Object.keys(item.selectedVariants).length === 0) && item.productType !== 'DIGITAL' && (
                  <p className="text-xs text-muted-foreground italic">
                    {locale === 'es' ? 'No hay detalles adicionales disponibles' : 'No additional details available'}
                  </p>
                )}
              </AccordionContent>
            </CardContent>
          </AccordionItem>
        </Accordion>
      </Card>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay productos en esta orden</p>
      </div>
    );
  }

  return (
    <Fragment>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
}

