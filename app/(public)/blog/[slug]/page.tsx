import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BlogPostContent } from './blog-post-content';
import { getBlogCategoryLabel } from '@/config/categories';

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Simple translation function for server-side
function getTranslation(locale: string, key: string): string {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'blog.back_to_blog': 'Volver al blog',
      'blog.post_not_found': 'Post no encontrado',
      'blog.preview.no_content': 'No hay contenido disponible',
    },
    en: {
      'blog.back_to_blog': 'Back to blog',
      'blog.post_not_found': 'Post not found',
      'blog.preview.no_content': 'No content available',
    },
  };

  return translations[locale]?.[key] || key;
}

// Helper function to get localized post field
function getLocalizedField<T>(locale: 'en' | 'es', enValue: T, esValue: T): T {
  return locale === 'en' ? enValue : esValue;
}

// Generar metadata dinámica para SEO y Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Usar español por defecto, se puede obtener del localStorage en el cliente
  const locale: 'en' | 'es' = 'es';

  try {
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { slugEn: slug },
          { slugEs: slug }
        ],
        status: 'PUBLISHED',
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!post) {
      return {
        title: 'Post no encontrado',
        description: 'El artículo que buscas no existe',
      };
    }

    const title = getLocalizedField(locale, post.titleEn, post.titleEs);
    const description = getLocalizedField(locale, post.descriptionEn, post.descriptionEs);
    const content = getLocalizedField(locale, post.contentEn, post.contentEs);
    const authorName = `${post.creator.firstName || ''} ${post.creator.lastName || ''}`.trim() || 'Nomadigma';
    
    // Extraer primer párrafo del contenido como descripción si no hay descriptionEn/Es
    let metaDescription = description;
    if (!metaDescription && content) {
      const textContent = content.replace(/<[^>]*>/g, '');
      metaDescription = textContent.substring(0, 160) + '...';
    }

    // Traducir categorías para metadata
    const categories = (post as any).categories as string[] | undefined;
    const categoryLabels = (categories || []).map((cat: string) => 
      getBlogCategoryLabel(cat, locale as 'en' | 'es')
    );

    // URL canónica
    const canonicalUrl = `https://nomadigma.com/blog/${slug}`;

    return {
      title: title || 'Post | Nomadigma',
      description: metaDescription || 'Artículo de Nomadigma',
      authors: [{ name: authorName }],
      keywords: categoryLabels.join(', ') || '',
      
      // Open Graph para redes sociales (WhatsApp, Telegram, Facebook, etc.)
      openGraph: {
        title: title || 'Post | Nomadigma',
        description: metaDescription || 'Artículo de Nomadigma',
        url: canonicalUrl,
        siteName: 'Nomadigma',
        locale: getLocalizedField(locale, 'en_US', 'es_ES'),
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: [authorName],
        images: post.coverImageThumbnail ? [
          {
            url: post.coverImageThumbnail,
            width: 500,
            height: 300,
            alt: title || 'Imagen del post',
          }
        ] : [],
        tags: categoryLabels,
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: title || 'Post | Nomadigma',
        description: metaDescription || 'Artículo de Nomadigma',
        images: post.coverImageThumbnail ? [post.coverImageThumbnail] : [],
        creator: '@nomadigma',
      },

      // Canonical URL y alternativas de idioma
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'es': `https://nomadigma.com/es/blog/${post.slugEs}`,
          'en': `https://nomadigma.com/en/blog/${post.slugEn}`,
        },
      },

      // Robots para control de indexación
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      // Otros meta tags útiles
      other: {
        'article:author': authorName,
        'article:published_time': post.publishedAt?.toISOString() || '',
        'article:modified_time': post.updatedAt?.toISOString() || '',
        'article:tag': categoryLabels.join(',') || '',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error | Nomadigma',
      description: 'Error al cargar el artículo',
    };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  // El locale se obtiene del localStorage en el cliente, usar español por defecto
  const locale: 'en' | 'es' = 'es';

  // Fetch post directly from database
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { slugEn: slug },
        { slugEs: slug }
      ],
      status: 'PUBLISHED',
    },
    include: {
      creator: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Map post to expected format
  const title = getLocalizedField(locale, post.titleEn, post.titleEs);
  const slugValue = getLocalizedField(locale, post.slugEn, post.slugEs);
  const description = getLocalizedField(locale, post.descriptionEn, post.descriptionEs);
  const content = getLocalizedField(locale, post.contentEn, post.contentEs);
  
  // Traducir categorías para mostrar
  const categories = (post as any).categories as string[] | undefined;
  const categoryLabels = (categories || []).map((cat: string) => 
    getBlogCategoryLabel(cat, locale as 'en' | 'es')
  );
    
  const mappedPost = {
    id: post.id,
    slug: slugValue,
    title,
    excerpt: description || (content ? content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : ''),
    content,
    publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
    viewCount: post.viewCount,
    author: {
      name: `${post.creator.firstName || ''} ${post.creator.lastName || ''}`.trim() || 'Anonymous',
      avatar: post.creator.imageUrl || undefined,
      bio: post.creator.bio || undefined,
    },
    categories: categoryLabels,
    attachments: post.coverImage ? [{
      id: 0,
      url: post.coverImage,
      type: 'image' as const
    }] : [],
    likes: post.likeCount,
    comments: post.commentCount,
    readingTime: post.readingTime || undefined,
  };

  // Get translations as object
  const translations = {
    'blog.back_to_blog': getTranslation(locale, 'blog.back_to_blog'),
    'blog.post_not_found': getTranslation(locale, 'blog.post_not_found'),
    'blog.preview.no_content': getTranslation(locale, 'blog.preview.no_content'),
  };

  return <BlogPostContent post={mappedPost} locale={locale} translations={translations} />;
}
