'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Youtube } from 'lucide-react';
import { YouTubeFeedSkeleton } from './youtube-feed-skeleton';

// Videos hardcodeados
const videos = [
  {
    url: "https://youtu.be/2a9Z_WGrUWI?si=7hHVlE-xkquSLl6p",
    es: "Choqué el dron y rayé la moto… pero encontré paz en Cebú | Filipinas",
    en: "I crashed my drone and scratched the motorbike... but found peace in Cebu | Philippines"
  },
  {
    url: "https://youtu.be/ShJHWAkJQG8?si=8t5HUxUM8aggguJ-",
    es: "Aventura en Bohol: tarseros, tortugas, playas y las Chocolate Hills | Filipinas",
    en: "Adventure in Bohol: Tarsiers, Turtles, Beaches, and Chocolate Hills 🐒🏝️ | Philippines"
  },
  {
    url: "https://www.youtube.com/watch?v=hRdi3BDrbXM",
    es: "Mi cumpleaños en el paraíso 🌴 Siargao, Filipinas",
    en: "My birthday in paradise🌴Siargao, Philippines"
  }
];

// Función para extraer el ID del video de YouTube
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Función para obtener el thumbnail de YouTube
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export function YouTubeFeed() {
  const { locale } = useTranslation();
  const [loading] = useState(false); // Por ahora siempre false, pero se puede usar para skeleton

  // El primer video es el grande (último), los otros 2 son los pequeños
  const featuredVideo = videos[0];
  const recentVideos = videos.slice(1, 3);

  const featuredVideoId = getYouTubeVideoId(featuredVideo.url);
  const featuredThumbnail = featuredVideoId ? getYouTubeThumbnail(featuredVideoId) : '';

  const sectionTitle = locale === 'es' ? 'Historias en Movimiento' : 'Stories in Motion';
  const sectionDescription = locale === 'es' 
    ? 'Cada viaje cuenta una historia. Cada historia transforma una mirada.'
    : 'Every journey tells a story. Every story transforms a perspective.';
  const viewMoreText = locale === 'es' ? 'Ver más' : 'View more';

  if (loading) {
    return <YouTubeFeedSkeleton />;
  }

  return (
    <section className="py-20 bg-background border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg text-left">
            {sectionDescription}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 w-full">
          {/* Video destacado (grande) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <a
              href={featuredVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer"
            >
              {featuredThumbnail && (
                <img
                  src={featuredThumbnail}
                  alt={locale === 'es' ? featuredVideo.es : featuredVideo.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                  <Play className="size-8 text-white fill-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                  {locale === 'es' ? featuredVideo.es : featuredVideo.en}
                </h3>
              </div>
            </a>
          </motion.div>

          {/* Miniaturas de videos (2 a la derecha) */}
          <div className="space-y-4">
            {recentVideos.map((video, index) => {
              const videoId = getYouTubeVideoId(video.url);
              const thumbnail = videoId ? getYouTubeThumbnail(videoId) : '';
              
              return (
              <motion.div
                  key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-video rounded-lg overflow-hidden bg-muted group cursor-pointer"
              >
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={locale === 'es' ? video.es : video.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                    )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Play className="size-6 text-white fill-white" />
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-sm font-medium drop-shadow-lg line-clamp-2">
                        {locale === 'es' ? video.es : video.en}
                  </p>
                </div>
                  </a>
              </motion.div>
              );
            })}
          </div>
        </div>

        {/* Botón Suscríbete al canal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white border-0 gap-2 relative overflow-hidden transition-all group"
            asChild
          >
            <a
              href="https://www.youtube.com/@nomadigma"
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10"
            >
              <Youtube className="size-5" />
              {locale === 'es' ? 'Suscríbete al canal' : 'Subscribe to channel'}
              <span className="absolute inset-0 bg-white/30 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-md origin-center" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

