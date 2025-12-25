import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BlogPostContent } from './blog-post-content';

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

// Generar metadata dinámica para SEO y Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

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

    const title = locale === 'en' ? post.titleEn : post.titleEs;
    const description = locale === 'en' ? post.descriptionEn : post.descriptionEs;
    const content = locale === 'en' ? post.contentEn : post.contentEs;
    const authorName = `${post.creator.firstName || ''} ${post.creator.lastName || ''}`.trim() || 'Nomadigma';
    
    // Extraer primer párrafo del contenido como descripción si no hay descriptionEn/Es
    let metaDescription = description;
    if (!metaDescription && content) {
      const textContent = content.replace(/<[^>]*>/g, '');
      metaDescription = textContent.substring(0, 160) + '...';
    }

    // URL canónica
    const canonicalUrl = `https://nomadigma.com/${locale}/blog/${slug}`;

    return {
      title: title || 'Post | Nomadigma',
      description: metaDescription || 'Artículo de Nomadigma',
      authors: [{ name: authorName }],
      keywords: post.hashtags?.join(', ') || '',
      
      // Open Graph para redes sociales (WhatsApp, Telegram, Facebook, etc.)
      openGraph: {
        title: title || 'Post | Nomadigma',
        description: metaDescription || 'Artículo de Nomadigma',
        url: canonicalUrl,
        siteName: 'Nomadigma',
        locale: locale === 'es' ? 'es_ES' : 'en_US',
        type: 'article',
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: [authorName],
        images: post.coverImage ? [
          {
            url: post.coverImage,
            width: 1200,
            height: 630,
            alt: title || 'Imagen del post',
          }
        ] : [],
        tags: post.hashtags || [],
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: title || 'Post | Nomadigma',
        description: metaDescription || 'Artículo de Nomadigma',
        images: post.coverImage ? [post.coverImage] : [],
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
        'article:tag': post.hashtags?.join(',') || '',
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
  const { locale, slug } = await params;

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
  const title = locale === 'en' ? post.titleEn : post.titleEs;
  const slugValue = locale === 'en' ? post.slugEn : post.slugEs;
  const description = locale === 'en' ? post.descriptionEn : post.descriptionEs;
  const content = locale === 'en' ? post.contentEn : post.contentEs;
    
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
      bio: undefined,
    },
    categories: [],
    hashtags: post.hashtags || [],
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
