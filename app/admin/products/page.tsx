'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from '@/hooks/use-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useTranslation } from '@/hooks/use-translation';

interface Product {
  id: string;
  title?: string;
  titleEn?: string;
  titleEs?: string;
  description: string;
  category: string;
  price: number;
  finalPrice?: number | null;
  isOnSale?: boolean;
  discountPercentage?: number | null;
  productType?: 'PHYSICAL' | 'DIGITAL';
  images: string[];
  active: boolean;
  slug: string;
  slugEn?: string;
  slugEs?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const { apiCall } = useApiClient();
  const router = useRouter();
  const { locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el título según el idioma
  const getProductTitle = (product: Product): string => {
    if (locale === 'en' && product.titleEn) {
      return product.titleEn;
    }
    if (locale === 'es' && product.titleEs) {
      return product.titleEs;
    }
    // Fallback al título principal o al que esté disponible
    return product.title || product.titleEn || product.titleEs || 'Sin título';
  };

  // Función para obtener el slug según el idioma
  const getProductSlug = (product: Product): string => {
    if (locale === 'en' && product.slugEn) {
      return product.slugEn;
    }
    if (locale === 'es' && product.slugEs) {
      return product.slugEs;
    }
    // Fallback al otro idioma si no existe en el idioma actual
    return product.slugEn || product.slugEs || '';
  };

  useEffect(() => {
    fetchProducts(pagination.page);
  }, []);

  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    const result = await apiCall(`/api/admin/products?page=${page}&limit=${pagination.limit}`);
    
    if (result.success && result.data) {
      setProducts(result.data.products);
      setPagination(result.data.pagination);
    } else {
      setError('Error al cargar productos');
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <p className="text-center">Cargando...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <p className="text-center text-red-500">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra los productos de la tienda</p>
        </div>
        <Button 
          onClick={() => router.push(`/admin/products/editor`)}
          className="gap-2"
        >
          <Plus className="size-4" />
          Crear Producto
        </Button>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo de Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estatus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      const slug = getProductSlug(product);
                      if (slug) {
                        window.open(`/store/products/${slug}`, '_blank');
                      } else {
                        toast.error('El producto no tiene slug disponible');
                      }
                    }}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors text-left"
                  >
                    {getProductTitle(product)}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.productType === 'DIGITAL'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {product.productType === 'DIGITAL' ? 'Digital' : product.productType === 'PHYSICAL' ? 'Físico' : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const productAny = product as any;
                    const finalPrice = productAny.finalPrice !== null && productAny.finalPrice !== undefined 
                      ? productAny.finalPrice 
                      : product.price;
                    
                    // Producto gratis (descuento 100%)
                    if (product.isOnSale && product.discountPercentage === 100) {
                      return (
                        <div className="flex items-center gap-2">
                          {product.price > 0 && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {locale === 'es' ? 'Gratis' : 'Free'}
                          </span>
                        </div>
                      );
                    } 
                    // Producto con descuento (< 100%)
                    else if (product.isOnSale && product.discountPercentage && product.discountPercentage > 0 && product.discountPercentage < 100) {
                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${finalPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            -{product.discountPercentage}%
                          </span>
                        </div>
                      );
                    } 
                    // Producto sin descuento
                    else {
                      return (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ${finalPrice.toFixed(2)}
                        </span>
                      );
                    }
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/products/editor?id=${product.id}`)}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{' '}
          de <span className="font-medium">{pagination.total}</span> productos
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchProducts(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchProducts(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </Container>
  );
}

