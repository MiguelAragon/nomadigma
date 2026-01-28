'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useUserContext } from '@/providers/auth-provider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { SafeHtmlContent } from '@/components/editor/safe-html-content';
import { ProductView } from '@/components/product/product-view';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Plus,
  Eye,
  Edit,
  Pencil,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { toast } from 'sonner';
import { Container } from '@/components/ui/container';
import { useTranslation } from '@/hooks/use-translation';
import { CATEGORY_SHOP } from '@/config/categories';

type EditorMode = 'edit' | 'preview';

// Función para generar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}


// Función para convertir variantes legacy a nueva estructura
function convertLegacyVariants(variants: any): Variant[] {
  if (!variants || !Array.isArray(variants)) return [];
  
  // Si ya está en el nuevo formato con items, retornar tal cual
  if (variants.length > 0 && variants[0].items) {
    return variants;
  }
  
  // Si viene en formato plano del backend (nuevo formato: {language, label, values})
  if (variants.length > 0 && variants[0].language) {
    // Agrupar por label para crear variantes
    const grouped: { [key: string]: VariantItem[] } = {};
    variants.forEach((v: any) => {
      const key = v.label || 'default';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push({
        language: v.language || 'es',
        label: v.label || '',
        values: v.values || []
      });
    });
    
    // Convertir a formato Variant[]
    return Object.values(grouped).map(items => ({ items }));
  }
  
  // Convertir formato legacy { label, values } a nuevo formato
  return variants.map((v: any) => ({
    items: [
      { language: 'es', label: v.label || '', values: v.values || [] }
    ]
  }));
}

// Función para convertir a formato plano para el backend
function flattenVariantsForBackend(variants: Variant[]): any[] {
  return variants.flatMap(variant => variant.items);
}

interface VariantItem {
  language: string;
  label: string;
  values: string[];
}

interface Variant {
  items: VariantItem[];
}

interface VariantFile {
  values: string[];
  type: 'url' | 'file';
  url: string;
  file?: File | null;
}

interface ProductFormData {
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  slugEn: string;
  slugEs: string;
  category: string;
  price: number; // Precio original (siempre)
  finalPrice: number | null; // Precio final con descuento (null si no hay descuento)
  isOnSale: boolean;
  discountPercentage: number;
  productType: 'PHYSICAL' | 'DIGITAL';
  hasShippingCost: boolean;
  shippingCost: number;
  active: boolean;
  imageFiles: File[];
  imagePreviews: string[];
  variants: Variant[];
  variantFiles: VariantFile[]; // Array de variables con formato [{values: string[], type: "url" | "file", url: string}]
  productId?: string;
  language?: string; // Idioma principal al crear
}

export default function ProductEditorPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { user: dbUser } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  
  const [mode, setMode] = useState<EditorMode>('edit');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>(locale as 'en' | 'es');
  const [isSlugEditable, setIsSlugEditable] = useState(false);

  const [finalPriceInputValue, setFinalPriceInputValue] = useState<string>('');
  
  const [formData, setFormData] = useState<ProductFormData>({
    titleEn: '',
    titleEs: '',
    descriptionEn: '',
    descriptionEs: '',
    slugEn: '',
    slugEs: '',
    category: '',
    price: 0,
    finalPrice: null,
    isOnSale: false,
    discountPercentage: 0,
    productType: 'PHYSICAL',
    hasShippingCost: false,
    shippingCost: 0,
    active: true,
    imageFiles: [],
    imagePreviews: [],
    variants: [],
    variantFiles: [],
    language: locale as 'en' | 'es',
  });

  const handleDescriptionChange = useCallback((html: string) => {
    if (currentLanguage === 'en') {
      setFormData(prev => ({ ...prev, descriptionEn: html }));
    } else {
      setFormData(prev => ({ ...prev, descriptionEs: html }));
    }
  }, [currentLanguage]);

  const loadProduct = useCallback(async (id: string) => {
    setLoadingProduct(true);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Producto no encontrado');
      }
      
      const product = result.data;
      
      if (product && product.id) {
        setIsEditing(true);
        const productAny = product as any;
        const isOnSale = (product as any).isOnSale || false;
        const discountPercentage = (product as any).discountPercentage || 0;
        const priceInDb = product.price || 0; // Precio original (siempre)
        const finalPriceInDb = (product as any).finalPrice; // Precio final si existe
        
        // Calcular precio final si no existe en DB
        let finalPrice: number | null = finalPriceInDb;
        if (finalPrice === null || finalPrice === undefined) {
          if (isOnSale && discountPercentage > 0) {
            if (discountPercentage === 100) {
              finalPrice = 0; // Gratis
            } else {
              finalPrice = priceInDb * (100 - discountPercentage) / 100;
            }
          } else {
            finalPrice = null; // No hay descuento
          }
        }
        
        // En el editor, mostramos el precio final (lo que ve el cliente)
        // Si no hay descuento, precio final = precio original
        const displayPrice = finalPrice !== null ? finalPrice : priceInDb;
        
        setFormData({
          titleEn: productAny.titleEn || product.title || '',
          titleEs: productAny.titleEs || product.title || '',
          descriptionEn: productAny.descriptionEn || product.description || '',
          descriptionEs: productAny.descriptionEs || product.description || '',
          slugEn: productAny.slugEn || '',
          slugEs: productAny.slugEs || '',
          category: product.category || '',
          price: priceInDb, // Precio original
          finalPrice: finalPrice, // Precio final
          isOnSale: isOnSale,
          discountPercentage: discountPercentage,
          productType: (product as any).productType || 'PHYSICAL',
          hasShippingCost: (product as any).hasShippingCost || false,
          shippingCost: (product as any).shippingCost || 0,
          active: product.active !== undefined ? product.active : true,
          imageFiles: [],
          imagePreviews: product.images || [],
          variants: convertLegacyVariants(product.variants as any) || [],
          variantFiles: (product as any).variantFiles 
            ? (Array.isArray((product as any).variantFiles) 
                ? (product as any).variantFiles 
                : // Convertir formato antiguo a nuevo formato
                  Object.entries((product as any).variantFiles).map(([value, url]) => ({
                    values: [value],
                    type: 'url' as const,
                    url: url as string
                  }))
              )
            : [],
          productId: product.id,
        });
        
        // Sincronizar el valor del input con el precio final
        setFinalPriceInputValue(displayPrice > 0 ? displayPrice.toString() : '');
        
        // Establecer idioma según el locale actual
        setCurrentLanguage(locale as 'en' | 'es');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Error al cargar el producto');
    } finally {
      setLoadingProduct(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push('/login');
      return;
    }

    const productId = searchParams.get('id');
    if (productId) {
      loadProduct(productId);
    }
  }, [isLoaded, userId, searchParams, loadProduct, router]);

  const switchLanguage = (lang: 'en' | 'es') => {
    setCurrentLanguage(lang);
  };

  // Componente reutilizable para botones de idioma
  const LanguageButtons = () => (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => switchLanguage('es')}
        disabled={loadingProduct}
        className={`h-8 px-4 transition-all font-medium ${
          currentLanguage === 'es' 
            ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
        }`}
      >
        ES
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => switchLanguage('en')}
        disabled={loadingProduct}
        className={`h-8 px-4 transition-all font-medium ${
          currentLanguage === 'en' 
            ? 'bg-background text-foreground shadow-sm hover:bg-background/90' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
        }`}
      >
        EN
      </Button>
    </div>
  );

  // Helpers para obtener valores del idioma actual
  const getCurrentTitle = () => currentLanguage === 'en' ? formData.titleEn : formData.titleEs;
  const getCurrentDescription = () => currentLanguage === 'en' ? formData.descriptionEn : formData.descriptionEs;
  const getCurrentSlug = () => currentLanguage === 'en' ? formData.slugEn : formData.slugEs;

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach((file) => {
      // Validar tipo de archivo
      if (!file.type || !allowedTypes.includes(file.type)) {
        toast.error(`El archivo ${file.name} no es una imagen válida. Solo se permiten JPG, JPEG, PNG o WebP.`);
        return;
      }

      // Validar tamaño
      if (file.size > maxSize) {
        toast.error(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
        return;
      }

      // Validar que no esté vacío
      if (file.size === 0) {
        toast.error(`El archivo ${file.name} está vacío.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          imageFiles: [...prev.imageFiles, file],
          imagePreviews: [...prev.imagePreviews, imageUrl],
        }));
      };
      reader.readAsDataURL(file);
    });
  };


  const removeImage = (index: number) => {
    setFormData(prev => {
      // Separar imágenes existentes (URLs) de nuevas (previews de archivos)
      const existingImages = prev.imagePreviews.filter(img => img.startsWith('http'));
      const newImagePreviews = prev.imagePreviews.filter(img => !img.startsWith('http'));
      const newImageFiles = prev.imageFiles;
      
      // Si el índice está en las imágenes existentes
      if (index < existingImages.length) {
        return {
          ...prev,
          imagePreviews: [...existingImages.filter((_, i) => i !== index), ...newImagePreviews],
        };
      }
      
      // Si el índice está en las nuevas imágenes
      const newIndex = index - existingImages.length;
      return {
        ...prev,
        imageFiles: newImageFiles.filter((_, i) => i !== newIndex),
        imagePreviews: [...existingImages, ...newImagePreviews.filter((_, i) => i !== newIndex)],
      };
    });
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { items: [{ language: currentLanguage, label: '', values: [] }] }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariantLabel = (variantIndex: number, label: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === variantIndex 
          ? { 
              ...v, 
              items: v.items.some(item => item.language === currentLanguage)
                ? v.items.map(item => item.language === currentLanguage ? { ...item, label } : item)
                : [...v.items, { language: currentLanguage, label, values: [] }]
            }
          : v
      ),
    }));
  };

  const addVariantValue = (variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === variantIndex 
          ? { 
              ...v, 
              items: v.items.some(item => item.language === currentLanguage)
                ? v.items.map(item => 
                    item.language === currentLanguage 
                      ? { ...item, values: [...item.values, ''] } 
                      : item
                  )
                : [...v.items, { language: currentLanguage, label: '', values: [''] }]
            }
          : v
      ),
    }));
  };

  const removeVariantValue = (variantIndex: number, valueIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === variantIndex 
          ? { 
              ...v, 
              items: v.items.map(item => 
                item.language === currentLanguage 
                  ? { ...item, values: item.values.filter((_, vi) => vi !== valueIndex) }
                  : item
              )
            }
          : v
      ),
    }));
  };

  const updateVariantValue = (variantIndex: number, valueIndex: number, value: string) => {
    setFormData(prev => {
      const newVariants = prev.variants.map((v, i) => 
        i === variantIndex 
          ? { 
              ...v, 
              items: v.items.map(item => 
                item.language === currentLanguage 
                  ? { ...item, values: item.values.map((val, vi) => vi === valueIndex ? value : val) }
                  : item
              )
            }
          : v
      );

      return {
        ...prev,
        variants: newVariants,
      };
    });
  };

  // Obtener todos los valores únicos de todas las variantes (sin filtrar por idioma)
  const getAllVariantValues = useMemo((): string[] => {
    const allValues: string[] = [];
    formData.variants.forEach(variant => {
      variant.items.forEach(item => {
        if (item.values) {
          item.values.forEach(value => {
            if (value && value.trim() !== '' && !allValues.includes(value)) {
              allValues.push(value);
            }
          });
        }
      });
    });
    return allValues;
  }, [formData.variants]);

  // Agregar nueva variable
  const addVariantFile = () => {
    setFormData(prev => ({
      ...prev,
      variantFiles: [
        ...prev.variantFiles,
        {
          values: [],
          type: 'url',
          url: '',
        }
      ]
    }));
  };

  // Remover variable
  const removeVariantFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variantFiles: prev.variantFiles.filter((_, i) => i !== index),
    }));
  };

  // Actualizar valores seleccionados de una variable
  const updateVariantFileValues = (index: number, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      variantFiles: prev.variantFiles.map((vf, i) => 
        i === index ? { ...vf, values } : vf
      ),
    }));
  };

  // Actualizar tipo de una variable
  const updateVariantFileType = (index: number, type: 'url' | 'file') => {
    setFormData(prev => ({
      ...prev,
      variantFiles: prev.variantFiles.map((vf, i) => 
        i === index ? { ...vf, type, url: type === 'url' ? vf.url : '', file: type === 'file' ? vf.file : null } : vf
      ),
    }));
  };

  // Actualizar URL de una variable
  const updateVariantFileUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      variantFiles: prev.variantFiles.map((vf, i) => 
        i === index ? { ...vf, url } : vf
      ),
    }));
  };

  // Manejar subida de archivo para una variable
  const handleVariantFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 100MB para archivos digitales)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error(currentLanguage === 'es' 
        ? 'El archivo no debe exceder 100MB' 
        : 'File must not exceed 100MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      variantFiles: prev.variantFiles.map((vf, i) => 
        i === index ? { ...vf, file, url: '' } : vf
      ),
    }));
  };

  // Obtener variantes para el idioma actual (para preview)
  const getCurrentVariants = () => {
    return formData.variants
      .map(variant => {
        const item = variant.items.find(i => i.language === currentLanguage);
        if (item && item.label && item.values.length > 0) {
          return { label: item.label, values: item.values };
        }
        return null;
      })
      .filter((v): v is { label: string; values: string[] } => v !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar según si es creación o edición
    // Nota: permitimos precio = 0 para productos gratis
    const finalPriceValue = formData.finalPrice !== null && formData.finalPrice !== undefined 
      ? formData.finalPrice 
      : formData.price;
    // Validar que el precio sea un número válido (puede ser 0)
    const priceIsValid = formData.price !== null && formData.price !== undefined && !isNaN(formData.price) && formData.price >= 0;
    const finalPriceIsValid = finalPriceValue !== null && finalPriceValue !== undefined && !isNaN(finalPriceValue) && finalPriceValue >= 0;
    
    if (isEditing) {
      // En edición, validar que haya al menos título y descripción en algún idioma
      if ((!formData.titleEn && !formData.titleEs) || (!formData.descriptionEn && !formData.descriptionEs) || !formData.category || !priceIsValid || !finalPriceIsValid) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
    } else {
      // En creación, validar campos del idioma seleccionado
      const language = formData.language || currentLanguage;
      if (language === 'en') {
        if (!formData.titleEn || !formData.descriptionEn || !formData.slugEn || !formData.category || !priceIsValid || !finalPriceIsValid) {
          toast.error('Por favor completa todos los campos requeridos en inglés');
          return;
        }
      } else {
        if (!formData.titleEs || !formData.descriptionEs || !formData.slugEs || !formData.category || !priceIsValid || !finalPriceIsValid) {
          toast.error('Por favor completa todos los campos requeridos en español');
          return;
        }
      }
    }

    // Validar variables para productos digitales
    if (formData.productType === 'DIGITAL' && formData.variantFiles.length > 0) {
      for (const vf of formData.variantFiles) {
        if (vf.values.length === 0) {
          toast.error(
            currentLanguage === 'es' 
              ? 'Cada variable debe tener al menos un valor seleccionado'
              : 'Each variable must have at least one value selected'
          );
          return;
        }
        if (vf.type === 'url' && !vf.url.trim()) {
          toast.error(
            currentLanguage === 'es' 
              ? 'Las variables de tipo URL deben tener una URL válida'
              : 'URL type variables must have a valid URL'
          );
          return;
        }
        // Para archivos, debe tener un archivo nuevo O una URL existente (cuando se edita)
        if (vf.type === 'file' && !vf.file && !vf.url) {
          toast.error(
            currentLanguage === 'es' 
              ? 'Las variables de tipo archivo deben tener un archivo seleccionado'
              : 'File type variables must have a file selected'
          );
          return;
        }
      }
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Si es creación, enviar language y solo campos del idioma seleccionado
      if (!isEditing) {
        const language = formData.language || currentLanguage;
        formDataToSend.append('language', language);
        
        if (language === 'en') {
          formDataToSend.append('titleEn', formData.titleEn);
          formDataToSend.append('descriptionEn', formData.descriptionEn);
          formDataToSend.append('slugEn', formData.slugEn);
        } else {
          formDataToSend.append('titleEs', formData.titleEs);
          formDataToSend.append('descriptionEs', formData.descriptionEs);
          formDataToSend.append('slugEs', formData.slugEs);
        }
      } else {
        // En edición, enviar todos los campos que existan
        if (formData.titleEn) formDataToSend.append('titleEn', formData.titleEn);
        if (formData.titleEs) formDataToSend.append('titleEs', formData.titleEs);
        if (formData.descriptionEn) formDataToSend.append('descriptionEn', formData.descriptionEn);
        if (formData.descriptionEs) formDataToSend.append('descriptionEs', formData.descriptionEs);
        if (formData.slugEn) formDataToSend.append('slugEn', formData.slugEn);
        if (formData.slugEs) formDataToSend.append('slugEs', formData.slugEs);
        
        // En edición, si hay un idioma seleccionado, enviar para traducción
        const translateFrom = formData.language || currentLanguage;
        if (translateFrom) {
          formDataToSend.append('translate', 'true');
          formDataToSend.append('translateFrom', translateFrom);
        }
      }
      
      formDataToSend.append('category', formData.category);
      // Enviar precio original (siempre)
      formDataToSend.append('price', formData.price.toString());
      // Enviar precio final (siempre, incluso si es null)
      if (formData.finalPrice !== null && formData.finalPrice !== undefined) {
        formDataToSend.append('finalPrice', formData.finalPrice.toString());
      } else {
        // Enviar 'null' como string para indicar que no hay descuento
        formDataToSend.append('finalPrice', 'null');
      }
      formDataToSend.append('isOnSale', formData.isOnSale.toString());
      formDataToSend.append('discountPercentage', formData.discountPercentage.toString());
      formDataToSend.append('productType', formData.productType);
      formDataToSend.append('hasShippingCost', formData.hasShippingCost.toString());
      formDataToSend.append('shippingCost', formData.shippingCost.toString());
      formDataToSend.append('active', formData.active.toString());

      // Agregar nuevas imágenes (solo archivos)
      formData.imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Agregar variantes (convertir a formato plano)
      if (formData.variants.length > 0) {
        const flattenedVariants = flattenVariantsForBackend(formData.variants);
        formDataToSend.append('variants', JSON.stringify(flattenedVariants));
      }

      // Agregar archivos de variantes (solo para productos digitales)
      if (formData.productType === 'DIGITAL' && formData.variantFiles.length > 0) {
        // Procesar cada variable
        const variantFilesToProcess: VariantFile[] = [];
        let fileIndex = 0;
        
        for (let i = 0; i < formData.variantFiles.length; i++) {
          const vf = formData.variantFiles[i];
          
          if (vf.type === 'file') {
            if (vf.file) {
              // Archivo nuevo: subir y obtener URL (se procesará en el backend)
              formDataToSend.append(`variantFile_${fileIndex}`, vf.file);
              variantFilesToProcess.push({
                values: vf.values,
                type: 'file',
                url: '', // Se completará en el backend
              });
              fileIndex++;
            } else if (vf.url) {
              // Archivo existente: mantener la URL existente
              variantFilesToProcess.push({
                values: vf.values,
                type: 'file',
                url: vf.url,
              });
            }
          } else if (vf.type === 'url' && vf.url) {
            variantFilesToProcess.push({
              values: vf.values,
              type: 'url',
              url: vf.url,
            });
          }
        }
        
        // Enviar el array de variables como JSON
        if (variantFilesToProcess.length > 0) {
          formDataToSend.append('variantFiles', JSON.stringify(variantFilesToProcess));
        }
      }

        // Si es edición, agregar el ID y las imágenes existentes a mantener
        if (formData.productId) {
          formDataToSend.append('productId', formData.productId);
          // Enviar las imágenes existentes (URLs que empiezan con http)
          const existingImages = formData.imagePreviews.filter(img => img.startsWith('http'));
          formDataToSend.append('existingImages', JSON.stringify(existingImages));
        }

      const url = '/api/admin/products';
      const method = formData.productId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error response:', result);
        throw new Error(result.message || 'Error al guardar el producto');
      }

      toast.success(formData.productId ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error.message || 'Error al guardar el producto';
      console.error('Error details:', {
        message: errorMessage,
        stack: error.stack,
        formData: {
          titleEn: formData.titleEn,
          titleEs: formData.titleEs,
          descriptionEn: formData.descriptionEn ? 'present' : 'missing',
          descriptionEs: formData.descriptionEs ? 'present' : 'missing',
          slugEn: formData.slugEn,
          slugEs: formData.slugEs,
          category: formData.category,
          price: formData.price,
          language: formData.language,
          isEditing,
        }
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loadingProduct) {
    return <PageLoader isLoading={true} />;
  }

  if (!userId) {
    return null;
  }

  // Si está en modo preview, usar el mismo patrón que el blog (sin scroll)
  if (mode === 'preview') {
    return (
      <Container className="min-h-screen bg-white pt-0">
        <div className="pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <LanguageButtons />
              
              {/* Toggle Editor/Preview */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('edit')}
                  className="h-8 px-3 transition-all font-medium text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('blog.editor.edit_mode') || 'Editor'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('preview')}
                  className="h-8 px-3 transition-all font-medium bg-background text-foreground shadow-sm hover:bg-background/90"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('blog.editor.preview') || 'Preview'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Preview Mode - Usando componente ProductView */}
          <article 
            itemScope 
            itemType="https://schema.org/Product"
          >
            {/* Hidden metadata for schema */}
            <meta itemProp="name" content={getCurrentTitle() || 'Sin título'} />
            <meta itemProp="description" content={getCurrentDescription().replace(/<[^>]*>/g, '').substring(0, 200)} />
            <meta itemProp="price" content={(formData.finalPrice !== null ? formData.finalPrice : formData.price).toString()} />
            <meta itemProp="priceCurrency" content="USD" />
            {formData.imagePreviews[0] && (
              <meta itemProp="image" content={formData.imagePreviews[0]} />
            )}

            <ProductView
              title={getCurrentTitle() || 'Sin título'}
              description={getCurrentDescription() || ''}
              category={formData.category || ''}
              price={formData.finalPrice !== null ? formData.finalPrice : formData.price || 0}
              originalPrice={formData.isOnSale && formData.discountPercentage && formData.discountPercentage < 100 ? formData.price : undefined}
              isOnSale={formData.isOnSale}
              discountPercentage={formData.discountPercentage}
              images={formData.imagePreviews}
              variants={getCurrentVariants()}
              createdAt={new Date().toISOString()}
              active={formData.active}
              locale={currentLanguage}
              animate={true}
            />
          </article>
        </div>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen bg-white pt-0">
      <div className="pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <LanguageButtons />
            
            {/* Toggle Editor/Preview */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode('edit')}
                className="h-8 px-3 transition-all font-medium bg-background text-foreground shadow-sm hover:bg-background/90"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('blog.editor.edit_mode') || 'Editor'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode('preview')}
                className="h-8 px-3 transition-all font-medium text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('blog.editor.preview') || 'Preview'}
              </Button>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Slug - Arriba del título, alineado a la derecha (como en blog) */}
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-2">
                {isSlugEditable ? (
                  <Input
                    id="slug"
                    value={getCurrentSlug()}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    onBlur={() => setIsSlugEditable(false)}
                    placeholder={locale === 'es' ? "producto-slug" : "product-slug"}
                    className="text-sm text-muted-foreground border-0 bg-transparent px-0 py-1 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      /store/products/{getCurrentSlug() || 'slug'}
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

          {/* Grid de 2 columnas como el visor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Columna izquierda - Imágenes */}
            <div className="flex flex-col">
              {/* Imágenes */}
              <div className="mb-8">
                

                {formData.imagePreviews.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {/* Imagen principal */}
                    <div className="relative group">
                      <img
                        src={formData.imagePreviews[0]}
                        alt="Preview principal"
                        className="w-full h-auto rounded-xl object-contain bg-gray-100 dark:bg-gray-800"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(0)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Galería de otras imágenes */}
                    {formData.imagePreviews.length > 1 && (
                      <div className="overflow-x-auto">
                        <div className="flex gap-3 pb-2">
                          {formData.imagePreviews.slice(1).map((preview, index) => (
                            <div key={index + 1} className="relative group flex-shrink-0">
                              <img
                                src={preview}
                                alt={`Preview ${index + 2}`}
                                className="w-24 h-24 rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={() => removeImage(index + 1)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 border-2 border-dashed rounded-xl p-8 text-center bg-muted">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No hay imágenes</p>
                  </div>
                )}

                {/* Agregar imágenes */}
                <div className="mt-2">
                  <input
                    type="file"
                    id="image-input"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-input">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('image-input')?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {currentLanguage === 'es' ? 'Agregar Imágenes' : 'Add Images'}
                    </Button>
                  </label>
                </div>

                {/* Sección de Tipo de Producto */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {currentLanguage === 'es' ? 'Tipo de Producto' : 'Product Type'}
                  </h3>
                  
                  {/* Tipo de producto */}
                  <div className="mb-4">
                    <Label htmlFor="product-type" className="text-sm font-medium mb-2 block">
                      {currentLanguage === 'es' ? 'Tipo de producto' : 'Product type'}
                    </Label>
                    <Select
                      value={formData.productType}
                      onValueChange={(value: 'PHYSICAL' | 'DIGITAL') => {
                        setFormData(prev => ({ 
                          ...prev, 
                          productType: value,
                          // Si cambia a digital, desactivar costo de envío
                          hasShippingCost: value === 'DIGITAL' ? false : prev.hasShippingCost,
                          shippingCost: value === 'DIGITAL' ? 0 : prev.shippingCost
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={currentLanguage === 'es' ? 'Selecciona un tipo' : 'Select a type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHYSICAL">
                          {currentLanguage === 'es' ? 'Producto Físico' : 'Physical Product'}
                        </SelectItem>
                        <SelectItem value="DIGITAL">
                          {currentLanguage === 'es' ? 'Producto Digital' : 'Digital Product'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Costo de envío - Solo si es producto físico */}
                  {formData.productType === 'PHYSICAL' && (
                    <div className="mb-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="hasShippingCost"
                          checked={formData.hasShippingCost}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            hasShippingCost: checked,
                            shippingCost: checked ? prev.shippingCost : 0
                          }))}
                        />
                        <Label htmlFor="hasShippingCost" className="cursor-pointer">
                          {currentLanguage === 'es' ? 'Tiene costo de envío' : 'Has shipping cost'}
                        </Label>
                      </div>

                      {formData.hasShippingCost && (
                        <div>
                          <Label htmlFor="shipping-cost" className="text-sm font-medium mb-2 block">
                            {currentLanguage === 'es' ? 'Costo de envío' : 'Shipping cost'}
                          </Label>
                          <Input
                            id="shipping-cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.shippingCost || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              shippingCost: parseFloat(e.target.value) || 0 
                            }))}
                            placeholder="0.00"
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sección de Variables - Solo para productos digitales */}
                {formData.productType === 'DIGITAL' && (() => {
                  // Usar valores memoizados
                  const availableValues = getAllVariantValues;
                  
                  return (
                    <div className="mt-8 border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {currentLanguage === 'es' ? 'Productos digitales' : 'Digital Products'}
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVariantFile}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {currentLanguage === 'es' ? 'Agregar Variable' : 'Add Variable'}
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {formData.variantFiles.map((vf, index) => {
                          const selectedValues = vf.values || [];
                        
                        return (
                          <div key={index} className="border rounded-lg p-4 bg-background relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariantFile(index)}
                              className="absolute top-4 right-4 h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            
                            {/* Selección de valores (chips) */}
                            <div className="mb-4">
                              {availableValues.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  {currentLanguage === 'es' 
                                    ? 'Primero agrega valores en las variantes' 
                                    : 'First add values in variants'}
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {availableValues.map((value) => {
                                    const isSelected = selectedValues.includes(value);
                                    return (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            updateVariantFileValues(index, selectedValues.filter(v => v !== value));
                                          } else {
                                            updateVariantFileValues(index, [...selectedValues, value]);
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                                          isSelected
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent'
                                        }`}
                                      >
                                        {value}
                                        {isSelected && (
                                          <X className="h-3 w-3 inline-block" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            
                            {/* Tipo de archivo y input/button en la misma línea */}
                            <div className="flex gap-2 items-end">
                              {/* Select para tipo de archivo a la izquierda */}
                              <div style={{ maxWidth: '120px' }}>
                                <Select
                                  value={vf.type}
                                  onValueChange={(value: 'url' | 'file') => updateVariantFileType(index, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder={currentLanguage === 'es' ? 'Tipo de archivo' : 'File type'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="url">URL</SelectItem>
                                    <SelectItem value="file">
                                      {currentLanguage === 'es' ? 'Archivo' : 'File'}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Input/Button a la derecha */}
                              <div className="flex-1">
                                {vf.type === 'url' ? (
                                  <div>
                                    <Input
                                      type="url"
                                      value={vf.url || ''}
                                      onChange={(e) => updateVariantFileUrl(index, e.target.value)}
                                      placeholder={currentLanguage === 'es' ? 'https://ejemplo.com/archivo.pdf' : 'https://example.com/file.pdf'}
                                      className="w-full"
                                    />
                                    {vf.url && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {vf.url}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <input
                                      type="file"
                                      id={`variant-file-${index}`}
                                      className="hidden"
                                      onChange={(e) => handleVariantFileUpload(index, e)}
                                      accept="*/*"
                                    />
                                    <label htmlFor={`variant-file-${index}`}>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => document.getElementById(`variant-file-${index}`)?.click()}
                                      >
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        {vf.file 
                                          ? (currentLanguage === 'es' ? 'Cambiar archivo' : 'Change file')
                                          : vf.url
                                            ? (currentLanguage === 'es' ? 'Cambiar archivo' : 'Change file')
                                            : (currentLanguage === 'es' ? 'Seleccionar archivo' : 'Select file')
                                        }
                                      </Button>
                                    </label>
                                    {vf.file && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {vf.file.name} ({(vf.file.size / 1024 / 1024).toFixed(2)} MB)
                                      </p>
                                    )}
                                    {vf.url && !vf.file && (
                                      <p className="text-xs text-muted-foreground mt-2 truncate">
                                        {vf.url.split('/').pop() || vf.url}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Columna derecha - Formulario (mismo orden que el preview) */}
            <div className="flex flex-col">
              {/* Product Header - Igual que en ProductView */}
              <div className="mb-6">
                {/* Título */}
                <Input
                  id="title"
                  value={getCurrentTitle()}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={locale === 'es' ? "Título del producto" : "Product Title"}
                  className="text-2xl md:text-3xl font-bold leading-tight border-0 bg-transparent px-0 h-auto min-h-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 mb-3"
                  required
                />

                {/* Precio y Descuento */}
                <div className="mb-4 space-y-4">
                  {/* Precio Final - Campo principal */}
                  <div>
                    <Label htmlFor="finalPrice" className="text-sm font-medium mb-2 block">
                      {currentLanguage === 'es' ? 'Precio Final (Lo que ve el cliente)' : 'Final Price (What customer sees)'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="finalPrice"
                        type="text"
                        inputMode="decimal"
                        value={finalPriceInputValue}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          
                          // Permitir cadena vacía, números y punto decimal
                          if (inputValue === '') {
                            setFinalPriceInputValue('');
                            setFormData(prev => ({
                              ...prev,
                              finalPrice: null,
                            }));
                            return;
                          }
                          
                          // Validar que sea un número válido (permitir decimales)
                          const numericValue = inputValue.replace(/[^0-9.]/g, '');
                          if (numericValue !== inputValue) {
                            return; // No permitir caracteres no numéricos excepto punto
                          }
                          
                          // Evitar múltiples puntos decimales
                          const parts = numericValue.split('.');
                          if (parts.length > 2) {
                            return;
                          }
                          
                          setFinalPriceInputValue(numericValue);
                          
                          // Solo actualizar formData cuando hay un valor numérico válido
                          const finalPriceValue = parseFloat(numericValue);
                          if (!isNaN(finalPriceValue) && finalPriceValue >= 0) {
                            setFormData(prev => {
                              let newPrice = prev.price;
                              let newFinalPrice: number | null = finalPriceValue;
                              
                              // Si hay descuento activo, calcular precio original
                              if (prev.isOnSale && prev.discountPercentage > 0) {
                                if (prev.discountPercentage === 100) {
                                  // Producto gratis: mantener precio original actual
                                  newFinalPrice = 0;
                                  newPrice = prev.price || 0;
                                } else {
                                  // Calcular precio original desde precio final
                                  newPrice = finalPriceValue / (1 - prev.discountPercentage / 100);
                                  newFinalPrice = finalPriceValue;
                                }
                              } else {
                                // Sin descuento: precio final = precio original
                                newPrice = finalPriceValue;
                                newFinalPrice = null;
                              }
                              
                              return {
                                ...prev,
                                price: newPrice,
                                finalPrice: newFinalPrice
                              };
                            });
                          }
                        }}
                        onBlur={(e) => {
                          // Al perder el foco, asegurar que el valor sea válido
                          const value = e.target.value.trim();
                          if (value === '') {
                            setFinalPriceInputValue('');
                            return;
                          }
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setFinalPriceInputValue(numValue.toString());
                          } else {
                            // Si no es válido, restaurar el último valor válido
                            const lastValidValue = formData.finalPrice !== null && formData.finalPrice !== undefined
                              ? formData.finalPrice
                              : formData.price !== null && formData.price !== undefined
                              ? formData.price
                              : '';
                            setFinalPriceInputValue(lastValidValue ? lastValidValue.toString() : '');
                          }
                        }}
                        placeholder="0.00"
                        required
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                  </div>

                  {/* Switch para activar descuento */}
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isOnSale"
                      checked={formData.isOnSale}
                      onCheckedChange={(checked) => {
                        setFormData(prev => {
                          const currentFinalPrice = prev.finalPrice !== null ? prev.finalPrice : prev.price;
                          let newPrice = prev.price;
                          let newFinalPrice: number | null = null;
                          
                          if (checked) {
                            // Activar descuento
                            if (prev.discountPercentage === 100) {
                              // Producto gratis: mantener precio original actual o usar precio final como original
                              newFinalPrice = 0;
                              newPrice = prev.price > 0 ? prev.price : currentFinalPrice;
                              setFinalPriceInputValue('0');
                            } else if (prev.discountPercentage > 0) {
                              // Calcular precio original desde precio final
                              newPrice = currentFinalPrice / (1 - prev.discountPercentage / 100);
                              newFinalPrice = currentFinalPrice;
                              setFinalPriceInputValue(currentFinalPrice > 0 ? currentFinalPrice.toString() : '');
                            } else {
                              // Sin porcentaje definido aún: mantener valores actuales
                              newPrice = prev.price || currentFinalPrice;
                              newFinalPrice = currentFinalPrice;
                              setFinalPriceInputValue(currentFinalPrice > 0 ? currentFinalPrice.toString() : '');
                            }
                          } else {
                            // Desactivar descuento: precio final = precio original
                            newPrice = currentFinalPrice;
                            newFinalPrice = null;
                            setFinalPriceInputValue(currentFinalPrice > 0 ? currentFinalPrice.toString() : '');
                          }
                          
                          return {
                            ...prev,
                            isOnSale: checked,
                            discountPercentage: checked ? prev.discountPercentage : 0,
                            price: newPrice,
                            finalPrice: newFinalPrice
                          };
                        });
                      }}
                    />
                    <Label htmlFor="isOnSale" className="cursor-pointer text-sm font-medium">
                      {currentLanguage === 'es' ? 'Aplicar descuento (mostrar precio original tachado)' : 'Apply discount (show original price crossed out)'}
                    </Label>
                  </div>

                  {/* Campos de descuento */}
                  {formData.isOnSale && (
                    <div className="space-y-3 pl-6 border-l-2 border-muted">
                      {/* Porcentaje de descuento */}
                      <div>
                        <Label htmlFor="discountPercentage" className="text-sm font-medium mb-2 block">
                          {currentLanguage === 'es' ? 'Porcentaje de descuento' : 'Discount Percentage'}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="discountPercentage"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.discountPercentage || ''}
                            onChange={(e) => {
                              const discount = parseFloat(e.target.value) || 0;
                              setFormData(prev => {
                                const currentFinalPrice = prev.finalPrice !== null ? prev.finalPrice : prev.price;
                                let newPrice = prev.price;
                                let newFinalPrice: number | null = null;
                                
                                if (discount === 100) {
                                  // Producto gratis
                                  newFinalPrice = 0;
                                  // Si no hay precio original, usar el precio final actual como original
                                  newPrice = prev.price > 0 ? prev.price : currentFinalPrice;
                                  setFinalPriceInputValue('0');
                                } else if (discount > 0) {
                                  // Calcular precio original desde precio final actual
                                  newPrice = currentFinalPrice / (1 - discount / 100);
                                  newFinalPrice = currentFinalPrice;
                                  setFinalPriceInputValue(currentFinalPrice > 0 ? currentFinalPrice.toString() : '');
                                } else {
                                  // Sin descuento
                                  newPrice = currentFinalPrice;
                                  newFinalPrice = null;
                                  setFinalPriceInputValue(currentFinalPrice > 0 ? currentFinalPrice.toString() : '');
                                }
                                
                                return {
                                  ...prev,
                                  discountPercentage: discount,
                                  price: newPrice,
                                  finalPrice: newFinalPrice
                                };
                              });
                            }}
                            placeholder="0"
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>

                      {/* Precio Original - Solo visible cuando hay descuento */}
                      {formData.discountPercentage === 100 ? (
                        <div>
                          <Label htmlFor="originalPrice" className="text-sm font-medium mb-2 block">
                            {currentLanguage === 'es' ? 'Precio Original (Para mostrar "Antes $X, ahora gratis")' : 'Original Price (To show "Was $X, now free")'}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="originalPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.price !== null && formData.price !== undefined ? formData.price : ''}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                
                                // Permitir cadena vacía temporalmente mientras el usuario escribe
                                if (inputValue === '') {
                                  setFormData(prev => ({
                                    ...prev,
                                    price: 0,
                                    finalPrice: 0 // Siempre gratis cuando descuento es 100%
                                  }));
                                  return;
                                }
                                
                                const originalPrice = parseFloat(inputValue);
                                // Validar que sea un número válido y >= 0
                                if (isNaN(originalPrice) || originalPrice < 0) {
                                  return;
                                }
                                setFormData(prev => ({
                                  ...prev,
                                  price: originalPrice,
                                  finalPrice: 0 // Siempre gratis cuando descuento es 100%
                                }));
                              }}
                              placeholder="0.00"
                              className="w-32"
                            />
                            <span className="text-sm text-muted-foreground">USD</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentLanguage === 'es' 
                              ? 'Este precio se mostrará tachado para productos gratis'
                              : 'This price will be shown crossed out for free products'}
                          </p>
                        </div>
                      ) : formData.discountPercentage > 0 && formData.discountPercentage < 100 ? (
                        <div>
                          <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                            {currentLanguage === 'es' ? 'Precio Original (Calculado automáticamente)' : 'Original Price (Calculated automatically)'}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={formData.price.toFixed(2)}
                              disabled
                              className="w-32 bg-muted"
                            />
                            <span className="text-sm text-muted-foreground">USD</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentLanguage === 'es' 
                              ? `Se calcula desde el precio final (${(formData.finalPrice || formData.price).toFixed(2)} USD) con ${formData.discountPercentage}% de descuento`
                              : `Calculated from final price (${(formData.finalPrice || formData.price).toFixed(2)} USD) with ${formData.discountPercentage}% discount`}
                          </p>
                        </div>
                      ) : null}

                      {/* Vista previa del precio */}
                      {formData.discountPercentage > 0 && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-2">
                            {currentLanguage === 'es' ? 'Vista previa:' : 'Preview:'}
                          </p>
                          {formData.discountPercentage === 100 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-primary">
                                {currentLanguage === 'es' ? 'Gratis' : 'Free'}
                              </span>
                              {formData.price > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${formData.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-primary">
                                ${(formData.finalPrice || formData.price).toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${formData.price.toFixed(2)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{formData.discountPercentage}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Categoría */}
                <div className="mb-4">
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                    {currentLanguage === 'es' ? 'Categoría' : 'Category'}
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={currentLanguage === 'es' ? 'Selecciona una categoría' : 'Select a category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_SHOP).map(([key, categoryData]) => {
                        // Usar el key como value para guardar en DB (guides, services, essentials, others)
                        const dbValue = key;
                        // Mostrar el label traducido según el idioma actual
                        const displayLabel = categoryData[currentLanguage as 'en' | 'es'];
                        return (
                          <SelectItem key={key} value={dbValue}>
                            {displayLabel}
                        </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Variantes */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">
                    {currentLanguage === 'es' ? 'Variantes (Colores, Composición, etc.)' : 'Variants (Colors, Composition, etc.)'}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {currentLanguage === 'es' ? 'Agregar Variante' : 'Add Variant'}
                  </Button>
                </div>

                {/* Vista previa de variantes (solo si tienen label y valores) */}
                {formData.variants.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {formData.variants
                      .map((variant, variantIndex) => {
                        const currentItem = variant.items.find(item => item.language === currentLanguage);
                        if (!currentItem || !currentItem.label || currentItem.values.length === 0) return null;
                        return { variant, variantIndex, currentItem };
                      })
                      .filter((v): v is { variant: Variant; variantIndex: number; currentItem: VariantItem } => v !== null)
                      .map(({ variant, variantIndex, currentItem }) => (
                        <div key={variantIndex} className="mb-4">
                          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                            {currentItem.label || 'Variante'}
                          </label>
                          <div className="flex gap-2">
                            {currentItem.values.map((value) => (
                              <button
                                key={value}
                                type="button"
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-black border border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                  
                  {/* Editor de variantes */}
                  {formData.variants.length > 0 && (() => {
                    // Filtrar variantes del idioma actual
                    const variantsForCurrentLanguage = formData.variants
                      .map((variant, variantIndex) => {
                        const currentItem = variant.items.find(item => item.language === currentLanguage);
                        if (!currentItem) {
                          return null;
                        }
                        return { variant, variantIndex, currentItem };
                      })
                      .filter((v): v is { variant: Variant; variantIndex: number; currentItem: VariantItem } => v !== null);

                    if (variantsForCurrentLanguage.length === 0) {
                      return (
                        <div className="border rounded-lg p-4 bg-card mt-2">
                          <p className="text-sm text-muted-foreground text-center">
                            {currentLanguage === 'es' 
                              ? 'No hay variantes creadas en español. Crea una nueva variante para este idioma.'
                              : 'No variants created in English. Create a new variant for this language.'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="border rounded-lg p-4 bg-card mt-2">
                        <div className="space-y-4">
                          {variantsForCurrentLanguage.map(({ variant, variantIndex, currentItem }) => (
                            <div key={variantIndex} className="border rounded-lg p-3 bg-background">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={currentItem.label}
                                    onChange={(e) => updateVariantLabel(variantIndex, e.target.value)}
                                  placeholder={currentLanguage === 'es' ? 'Ej: Color, Talla, Composición' : 'E.g: Color, Size, Composition'}
                                    className="flex-1 text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariant(variantIndex)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                  {currentItem.values.map((value, valueIndex) => (
                                    <div key={valueIndex} className="flex items-center gap-1">
                                      <Input
                                        value={value}
                                        onChange={(e) => updateVariantValue(variantIndex, valueIndex, e.target.value)}
                                      placeholder={currentLanguage === 'es' ? 'Valor' : 'Value'}
                                        className="w-24 text-sm h-8"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeVariantValue(variantIndex, valueIndex)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addVariantValue(variantIndex)}
                                    className="h-8 text-sm"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                  {currentLanguage === 'es' ? 'Valor' : 'Value'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* Descripción - Solo editor, sin vista previa */}
              <div className="w-full">
                <RichTextEditor
                  content={getCurrentDescription()}
                  onChange={handleDescriptionChange}
                  placeholder={currentLanguage === 'es' 
                    ? "Escribe la descripción del producto..." 
                    : "Write the product description..."}
                />
              </div>

              {/* Producto Activo - Al final */}
              <div className="flex items-center justify-between pt-4 border-t pb-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active" className="text-sm font-medium">Producto Activo</Label>
                  <p className="text-xs text-muted-foreground">
                    El producto será visible en la tienda cuando esté activo
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/products')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          </div>
        </form>
        </div>
    </Container>
  );
}
