import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function ProductNotFound() {
  return (
    <Container className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-8">
          El producto que buscas no está disponible o ha sido eliminado.
        </p>
        <Button asChild>
          <Link href="/store">Volver a la tienda</Link>
        </Button>
      </div>
    </Container>
  );
}


