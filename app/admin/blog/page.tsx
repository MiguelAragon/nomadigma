'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from '@/hooks/use-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Post {
  id: string;
  titleEn: string;
  titleEs: string;
  slugEn: string;
  slugEs: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  language: string;
  createdAt: string;
  publishedAt: string | null;
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

export default function AdminPostsPage() {
  const { apiCall } = useApiClient();
  const router = useRouter();
  const { locale } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPostId, setUpdatingPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(pagination.page);
  }, []);

  const fetchPosts = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    const result = await apiCall(`/api/admin/blog?page=${page}&limit=${pagination.limit}`);
    
    if (result.success && result.data) {
      setPosts(result.data.posts);
      setPagination(result.data.pagination);
    } else {
      setError('Error al cargar posts');
    }
    
    setIsLoading(false);
  };

  const handleStatusChange = async (postId: string, newStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED') => {
    setUpdatingPostId(postId);
    
    const result = await apiCall('/api/admin/blog', {
      method: 'PATCH',
      body: JSON.stringify({ postId, status: newStatus }),
    });

    if (result.success) {
      setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p));
      toast.success('Status actualizado correctamente');
    }
    
    setUpdatingPostId(null);
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
      <div className="mb-8 flex items-start justify-between">
        <div>
        <h1 className="text-3xl font-bold mb-2">Gestión de Posts</h1>
        <p className="text-muted-foreground">Administra el estado de los posts del blog</p>
        </div>
        <Button 
          onClick={() => router.push(`/${locale}/blog/editor`)}
          className="gap-2"
        >
          <Plus className="size-4" />
          Crear Post
        </Button>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Publicado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ver
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {post.titleEs}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.titleEn}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {post.creator.firstName} {post.creator.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={post.status}
                    onChange={(e) => handleStatusChange(post.id, e.target.value as any)}
                    disabled={updatingPostId === post.id}
                    className="px-3 py-1 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: post.status === 'PUBLISHED' ? '#dcfce7' : post.status === 'PENDING_REVIEW' ? '#dbeafe' : post.status === 'DRAFT' ? '#fef3c7' : '#fee2e2',
                      color: post.status === 'PUBLISHED' ? '#16a34a' : post.status === 'PENDING_REVIEW' ? '#1e40af' : post.status === 'DRAFT' ? '#d97706' : '#dc2626',
                      borderColor: post.status === 'PUBLISHED' ? '#bbf7d0' : post.status === 'PENDING_REVIEW' ? '#bfdbfe' : post.status === 'DRAFT' ? '#fde68a' : '#fecaca',
                    }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_REVIEW">PENDING REVIEW</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`/es/blog/${post.slugEs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    Ver post →
                  </a>
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
          de <span className="font-medium">{pagination.total}</span> posts
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchPosts(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchPosts(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

