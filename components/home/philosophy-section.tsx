'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, Compass, Globe, MapPin } from 'lucide-react';

export function PhilosophySection() {
  const { locale } = useTranslation();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleJoinClick = () => {
    if (isLoading) return;
    
    if (user) {
      router.push(`/blog/editor`);
    } else {
      router.push(`/login`);
    }
  };

  const joinText = locale === 'es' 
    ? 'Únete y comienza a compartir tus experiencias de viaje.'
    : 'Join and start sharing your travel experiences.';
  
  const buttonText = user
    ? (locale === 'es' ? 'Crea un post' : 'Create a post')
    : (locale === 'es' ? 'Únete a la comunidad' : 'Join to the community');
  
  const buttonIcon = user ? <FileText className="size-5" /> : <UserPlus className="size-5" />;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background con gradiente dinámico */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
      
      {/* Elementos decorativos flotantes */}
      <div className="absolute top-20 left-10 opacity-20 dark:opacity-10">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Compass className="size-32 text-indigo-500" />
        </motion.div>
      </div>
      
      <div className="absolute bottom-20 right-10 opacity-20 dark:opacity-10">
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Globe className="size-40 text-purple-500" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Columna izquierda - Título y frase principal */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {locale === 'es' ? '¿Qué es Nomadigma?' : 'What is Nomadigma?'}
              </h2>
              
              <div className="relative">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground italic leading-relaxed"
                >
                  {locale === 'es' 
                    ? 'Deja de ser turista. Conviértete en puente.'
                    : 'Stop being a tourist. Become a bridge.'}
                </motion.p>
                
                {/* Línea decorativa */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 mt-4 rounded-full"
                />
              </div>
            </div>

            {/* Botón destacado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                size="lg" 
                onClick={handleJoinClick}
                disabled={isLoading}
                className="text-lg px-8 py-6 gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                {buttonIcon}
                {buttonText}
              </Button>
            </motion.div>
          </motion.div>

          {/* Columna derecha - Contenido */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 text-lg md:text-xl leading-relaxed"
          >
            <div className="space-y-6 text-muted-foreground">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {locale === 'es' 
                  ? 'Imagina que cada viaje que haces no solo te transforma a ti, sino que también inspira a alguien más a dar ese primer paso. Eso es Nomadigma: una comunidad donde los viajeros comparten experiencias reales, consejos prácticos y historias que realmente importan.'
                  : 'Imagine that every trip you take doesn\'t just transform you, but also inspires someone else to take that first step. That\'s Nomadigma: a community where travelers share real experiences, practical tips, and stories that really matter.'}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {locale === 'es' 
                  ? 'Porque viajar da felicidad, y la felicidad es mejor cuando se comparte.'
                  : 'Because traveling brings happiness, and happiness is better when shared.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-indigo-500/20 dark:border-indigo-500/30"
              >
                <div className="flex items-start gap-4">
                  <MapPin className="size-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                  <p className="text-foreground font-medium">
                    {locale === 'es' 
                      ? 'Cuando compartes tu experiencia, no solo estás contando una historia. Estás dando a alguien la confianza para explorar, el conocimiento para planear mejor, y la inspiración para salir de su zona de confort.'
                      : 'When you share your experience, you\'re not just telling a story. You\'re giving someone the confidence to explore, the knowledge to plan better, and the inspiration to step out of their comfort zone.'}
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-foreground font-medium text-lg pt-2"
              >
                {joinText}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

