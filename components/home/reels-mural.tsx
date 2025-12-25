'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReelsMuralSkeleton } from './reels-mural-skeleton';

// Links de TikTok
const tiktokVideos = [
  'https://www.tiktok.com/@nomadigma/video/7571491376433466680',
  'https://www.tiktok.com/@nomadigma/video/7571489249204243723',
  'https://www.tiktok.com/@nomadigma/video/7571486524743683384',
  'https://www.tiktok.com/@nomadigma/video/7571485534460071224',
  'https://www.tiktok.com/@nomadigma/video/7571484154836028684',
];

interface TikTokVideoData {
  url: string;
  thumbnail: string | null;
}

export function ReelsMural() {
  const { locale } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<TikTokVideoData[]>([]);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        setLoading(true);
        const videoData = await Promise.all(
          tiktokVideos.map(async (url) => {
            try {
              // Usar nuestro endpoint API para evitar problemas de CORS
              const response = await fetch(`/api/tiktok?url=${encodeURIComponent(url)}`);
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.thumbnail) {
                  return { url, thumbnail: data.thumbnail };
                }
              }
            } catch (error) {
              console.error(`Error fetching thumbnail for ${url}:`, error);
            }
            return { url, thumbnail: null };
          })
        );
        setVideos(videoData);
      } catch (error) {
        console.error('Error fetching TikTok thumbnails:', error);
        // Si falla, usar los videos sin thumbnails
        setVideos(tiktokVideos.map(url => ({ url, thumbnail: null })));
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnails();
  }, []);

  const sectionTitle = locale === 'es' ? 'Fragmentos de Propósito' : 'Purpose Fragments';
  const sectionDescription = locale === 'es'
    ? 'Breves destellos de viajes: un consejo rápido, un paisaje, una reflexión de 15 segundos.'
    : 'Moments that move us, stories that inspire, journeys that transform.';
  const viewMoreText = locale === 'es' ? 'Ver más' : 'View more';

  if (loading) {
    return <ReelsMuralSkeleton />;
  }

  return (
    <section className="py-20 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
                {sectionDescription}
              </p>
            </div>
            <Button
              variant="ghost"
              className="gap-2"
              asChild
            >
              <a
                href="https://www.tiktok.com/@nomadigma"
                target="_blank"
                rel="noopener noreferrer"
              >
                {viewMoreText}
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Feed horizontal estilo TikTok */}
        <div className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {videos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-[280px] h-[500px] rounded-2xl overflow-hidden bg-muted group cursor-pointer flex-shrink-0"
              >
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-pink-500/30" />
                  )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                    <Play className="size-8 text-white fill-white ml-1" />
                  </div>
                </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

