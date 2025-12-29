import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo/>
          </Link>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>

        {/* Message */}
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
          Página no encontrada
        </p>

        {/* Button */}
        <Button asChild size="lg" className="gap-2" variant="outline">
          <Link href="/">
            <Home className="size-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}

