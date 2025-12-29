'use client';

import { useEffect, useState } from 'react';
import { useApiClient } from '@/hooks/use-api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastSignInAt: string | null;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersPage() {
  const { apiCall } = useApiClient();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
      fetchUsers(pagination.page);
  }, []);

  const fetchUsers = async (page: number) => {
    setIsLoading(true);
    setError(null);
    
    const result = await apiCall(`/api/users?page=${page}&limit=${pagination.limit}`);
    
    if (result.success && result.data) {
      setUsers(result.data.users);
      setPagination(result.data.pagination);
    } else {
      setError('Error al cargar usuarios');
    }
    
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    setUpdatingUserId(userId);
    
    const result = await apiCall('/api/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (result.success) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Rol actualizado correctamente');
    }
    
    setUpdatingUserId(null);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los usuarios y sus roles en el sistema</p>
      </div>
      
      {/* Tabla */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Último Login
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.imageUrl && (
                      <img
                        className="h-10 w-10 rounded-full mr-3"
                        src={user.imageUrl}
                        alt={user.firstName || user.email}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                    disabled={updatingUserId === user.id}
                    className="px-3 py-1 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: user.role === 'ADMIN' ? '#f3e8ff' : '#dcfce7',
                      color: user.role === 'ADMIN' ? '#7c3aed' : '#16a34a',
                      borderColor: user.role === 'ADMIN' ? '#c4b5fd' : '#bbf7d0',
                    }}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Nunca'}
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
          de <span className="font-medium">{pagination.total}</span> usuarios
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchUsers(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 dark:border -gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchUsers(pagination.page + 1)}
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

