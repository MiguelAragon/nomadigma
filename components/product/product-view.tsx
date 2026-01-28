'use client';

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SafeHtmlContent } from '@/components/editor/safe-html-content';
import { ShoppingCart, Tag, CheckCircle2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStoreClient } from '@/app/(public)/store/components/context';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Zoom } from 'yet-another-react-lightbox/plugins';

interface ProductViewProps {
  title: string;
  description: string;
  category: string;
  price: number; // Precio final (lo que ve el cliente)
  originalPrice?: number; // Precio original (para mostrar tachado cuando hay descuento)
  isOnSale?: boolean;
  discountPercentage?: number | null;
  images: string[];
  variants?: Array<{ label: string; values: string[] }>;
  createdAt: string;
  active: boolean;
  locale: string;
  animate?: boolean;
  onAddToCart?: (selectedVariants?: Record<string, string>) => void;
  productId?: string;
}

function ProductViewComponent({
  title,
  description,
  category,
  price,
  originalPrice,
  isOnSale = false,
  discountPercentage = null,
  images,
  variants = [],
  createdAt,
  active,
  locale,
  animate = true,
  onAddToCart,
  productId,
}: ProductViewProps) {
  const MotionDiv = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  } : {};

  const mainImage = images && images.length > 0 ? images[0] : null;
  const otherImages = images && images.length > 1 ? images.slice(1) : [];
  
  // Inicializar con el primer valor de cada variante
  const getInitialVariants = (): Record<string, string> => {
    const initial: Record<string, string> = {};
  variants.forEach(variant => {
    if (variant.values.length > 0) {
        initial[variant.label] = variant.values[0];
    }
  });
    return initial;
  };
  
  const { state, handleUpdateCartItemQuantity, handleRemoveFromCart } = useStoreClient();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(getInitialVariants());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState<Record<number, boolean>>({});
  const [thumbnailError, setThumbnailError] = useState<Record<number, boolean>>({});
  const router = useRouter();

  // Verificar si el producto es gratis
  const isFree = price === 0 || (isOnSale && discountPercentage === 100);

  // Verificar si el producto ya está en el carrito
  const existingCartItem = productId 
    ? state.cartItems.find(item => item.id === productId)
    : null;
  
  // Si es gratis, limitar cantidad inicial a 1
  const initialQuantity = isFree ? 1 : (existingCartItem?.quantity || 1);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAddedToCart, setIsAddedToCart] = useState(!!existingCartItem);

  // Actualizar estado cuando cambie el carrito
  useEffect(() => {
    const currentCartItem = productId 
      ? state.cartItems.find(item => item.id === productId)
      : null;
    
    if (currentCartItem) {
      // Si es gratis, limitar cantidad a 1
      const maxQuantity = isFree ? 1 : currentCartItem.quantity;
      setQuantity(maxQuantity);
      setIsAddedToCart(true);
    } else {
      setQuantity(isFree ? 1 : 1);
      setIsAddedToCart(false);
    }
  }, [state.cartItems, productId, isFree]);

  const allImages = mainImage ? [mainImage, ...otherImages] : otherImages;

  // Asegurar que siempre haya un valor seleccionado para cada variante
  useEffect(() => {
    setSelectedVariants(prev => {
      const updated = { ...prev };
      let hasChanges = false;
      
      variants.forEach(variant => {
        if (variant.values.length > 0) {
          // Si no hay valor seleccionado o el valor seleccionado no existe en los valores disponibles
          if (!updated[variant.label] || !variant.values.includes(updated[variant.label])) {
            updated[variant.label] = variant.values[0];
            hasChanges = true;
          }
        }
      });
      
      return hasChanges ? updated : prev;
    });
  }, [variants]);

  const handleVariantSelect = (variantLabel: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantLabel]: value }));
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleBuyNow = () => {
    if (onAddToCart) {
      onAddToCart(selectedVariants);
      setIsAddedToCart(true);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!productId) return;
    
    // Si es gratis, no permitir más de 1
    if (isFree && delta > 0 && quantity >= 1) {
      return;
    }
    
    const newQuantity = quantity + delta;
    
    // Si la cantidad es 0 o menor, eliminar del carrito
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      setQuantity(1);
      setIsAddedToCart(false);
    } else {
      setQuantity(newQuantity);
      if (isAddedToCart) {
        handleUpdateCartItemQuantity(productId, newQuantity);
      }
    }
  };

  const handleGoToCart = () => {
    // Solo ir a checkout si hay productos en el carrito, sino ir a store
    if (state.cartItems.length > 0) {
      router.push('/store/checkout');
    } else {
      router.push('/store');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Main Image - Left Side */}
      {mainImage && (
        <MotionDiv
          {...animationProps}
          {...(animate && { transition: { duration: 0.6, delay: 0.2 } })}
          className="flex flex-col"
        >
          <div 
            className="relative w-full rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(0)}
          >
            {!mainImageLoaded && !mainImageError && (
              <div className="absolute inset-0 shimmer"></div>
            )}

            {!mainImageError && (
              <img
                src={mainImage}
                alt={title}
                onLoad={() => setMainImageLoaded(true)}
                onError={() => {
                  setMainImageError(true);
                  setMainImageLoaded(true);
                }}
                className={`w-full h-auto object-contain ${
                  mainImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {mainImageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-muted-foreground">No image available</div>
              </div>
            )}
          </div>
          
          {/* Gallery Scroll Horizontal */}
          {otherImages.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <div className="flex gap-3 pb-2" style={{ scrollbarWidth: 'thin' }}>
                {otherImages.map((image, index) => {
                  const thumbnailIndex = index + 1;
                  const isLoaded = thumbnailLoaded[thumbnailIndex] || false;
                  const hasError = thumbnailError[thumbnailIndex] || false;

                  return (
                    <div
                      key={index}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity relative"
                      onClick={() => handleImageClick(thumbnailIndex)}
                    >
                      {!isLoaded && !hasError && (
                        <div className="absolute inset-0 shimmer"></div>
                      )}

                      {!hasError && (
                        <img
                          src={image}
                          alt={`${title} - ${index + 2}`}
                          onLoad={() => setThumbnailLoaded(prev => ({ ...prev, [thumbnailIndex]: true }))}
                          onError={() => {
                            setThumbnailError(prev => ({ ...prev, [thumbnailIndex]: true }));
                            setThumbnailLoaded(prev => ({ ...prev, [thumbnailIndex]: true }));
                          }}
                          className={`w-full h-full object-cover ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      )}

                      {hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <div className="text-muted-foreground text-xs">No image</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </MotionDiv>
      )}

      {/* Product Info - Right Side */}
      <div className="flex flex-col">
        {/* Product Header */}
        <MotionDiv
          {...animationProps}
          {...(animate && { transition: { duration: 0.6 } })}
          className="mb-6"
        >
          {/* Título */}
          <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
            {title}
          </h1>

          {/* Precio */}
          <div>
            {isOnSale && discountPercentage === 100 && originalPrice ? (
              // Producto gratis
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  {locale === 'es' ? 'Gratis' : 'Free'}
                </span>
                <span className="text-muted-foreground line-through text-base">
                  ${originalPrice.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {locale === 'es' ? '100% Descuento' : '100% Off'}
                </Badge>
              </div>
            ) : isOnSale && discountPercentage && discountPercentage < 100 && originalPrice ? (
              // Producto con descuento parcial
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${price.toFixed(2)}
                </span>
                <span className="text-muted-foreground line-through text-base">
                  ${originalPrice.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              </div>
            ) : (
              // Producto sin descuento
              <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </MotionDiv>

        {/* Variantes */}
        {variants.length > 0 && (
          <MotionDiv
            {...animationProps}
            {...(animate && { transition: { duration: 0.6, delay: 0.3 } })}
            className="mb-1"
          >
            {variants.map((variant, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                  {variant.label}
                </label>
                <div className="flex gap-2">
                  {variant.values.map((value) => {
                    const isSelected = selectedVariants[variant.label] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleVariantSelect(variant.label, value)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-white text-black border border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </MotionDiv>
        )}

        {/* Add to Cart and Buy Buttons */}
        {active && onAddToCart && (
          <MotionDiv
            {...animationProps}
            {...(animate && { transition: { duration: 0.6, delay: 0.4 } })}
            className="mb-4"
          >
            {!isAddedToCart ? (
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full px-6 py-4 h-12 text-base font-medium text-white rounded-lg"
                style={{ backgroundColor: '#5433eb' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a2dd9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5433eb'}
              >
                {locale === 'es' ? 'Comprar ya' : 'Buy Now'}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-3 bg-white dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isFree && quantity >= 1}
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      isFree && quantity >= 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button
                  onClick={handleGoToCart}
                  size="lg"
                  className="flex-1 px-6 py-4 text-base font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                >
                  <ShoppingBag className="size-5 mr-2" />
                  {locale === 'es' ? 'Ir a Carrito' : 'Go to Cart'}
                </Button>
              </div>
            )}
            
            {/* Categoría */}
            <div className="mt-4">
              <Badge 
                variant="outline" 
                className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700"
              >
                <Tag className="size-3 mr-1" />
                {category}
              </Badge>
            </div>
          </MotionDiv>
        )}

        {/* Description */}
        <MotionDiv
          {...animationProps}
          {...(animate && { transition: { duration: 0.6, delay: 0.5 } })}
          className="w-full"
        >
          {description ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <SafeHtmlContent content={description} />
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              {locale === 'es' ? 'No hay descripción disponible' : 'No description available'}
            </p>
          )}
        </MotionDiv>

      </div>

      {/* Lightbox */}
      {allImages.length > 0 && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={allImages.map(img => ({ src: img }))}
          plugins={[Zoom]}
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
        />
      )}
    </div>
  );
}

export const ProductView = memo(ProductViewComponent);

