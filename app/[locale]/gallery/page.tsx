'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Image } from 'lucide-react';

export default function GalleryPage() {
  const { locale, t } = useTranslation();

  const messages = {
    es: {
      title: 'Galería',
      message: 'No hay fotos todavía',
      description: 'Próximamente podrás ver todas las fotos de nuestros viajes aquí.',
    },
    en: {
      title: 'Gallery',
      message: 'No photos yet',
      description: 'Coming soon, you will be able to see all our travel photos here.',
    },
  };

  const content = messages[locale as 'es' | 'en'] || messages.es;

  return (
    <div className="bg-background">
      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-muted p-6">
                <Image className="size-12 text-muted-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {content.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              {content.message}
            </p>
            <p className="text-muted-foreground">
              {content.description}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

