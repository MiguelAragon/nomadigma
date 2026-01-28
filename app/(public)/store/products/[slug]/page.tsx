import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductContent } from './product-content';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).trim();

    // Buscar producto por slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slugEn: decodedSlug },
          { slugEs: decodedSlug },
        ],
      },
    });

    if (!product || !product.active) {
      return {
        title: 'Producto no encontrado',
        description: 'El producto que buscas no está disponible',
      };
    }

    const productAny = product as any;
    const title = productAny.titleEs || productAny.titleEn || productAny.title || 'Producto';
    const description = productAny.descriptionEs || productAny.descriptionEn || productAny.description || '';
    const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 160);

    return {
      title: `${title} | Nomadigma Store`,
      description: cleanDescription || `Producto: ${title}`,
      openGraph: {
        title: title,
        description: cleanDescription || `Producto: ${title}`,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: cleanDescription || `Producto: ${title}`,
        images: product.images && product.images.length > 0 ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error al cargar el producto',
      description: 'Error al cargar el producto',
    };
  }
}

export default async function ProductPage({ params }: PageProps) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug).trim();

    // Buscar producto por slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slugEn: decodedSlug },
          { slugEs: decodedSlug },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!product || !product.active) {
      notFound();
    }

    const productAny = product as any;
    
    // Pasar todos los datos sin filtrar - el componente cliente filtrará según el locale actual
    const mappedProduct = {
      id: product.id,
      slugEn: productAny.slugEn || '',
      slugEs: productAny.slugEs || '',
      titleEn: productAny.titleEn || '',
      titleEs: productAny.titleEs || '',
      descriptionEn: productAny.descriptionEn || '',
      descriptionEs: productAny.descriptionEs || '',
      category: product.category,
      price: product.price,
      finalPrice: productAny.finalPrice !== null && productAny.finalPrice !== undefined ? productAny.finalPrice : null,
      isOnSale: productAny.isOnSale || false,
      discountPercentage: productAny.discountPercentage || null,
      productType: productAny.productType || 'PHYSICAL',
      images: product.images || [],
      variants: product.variants as Array<{ language: string; label: string; values: string[] }> | null,
      active: product.active,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      creator: {
        id: product.creator.id,
        name: `${product.creator.firstName || ''} ${product.creator.lastName || ''}`.trim() || 'Anonymous',
        email: product.creator.email,
        avatar: product.creator.imageUrl || undefined,
        bio: product.creator.bio || undefined,
      },
    };

    return <ProductContent product={mappedProduct} />;
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
}

