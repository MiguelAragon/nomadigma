'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText } from 'lucide-react';

export function PhilosophySection() {
  const { locale } = useTranslation();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleJoinClick = () => {
    if (isLoading) return;
    
    if (user) {
      router.push(`/${locale}/blog/editor`);
    } else {
      router.push(`/${locale}/login`);
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
    <section className="py-20 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            {locale === 'es' ? '¿Qué es Nomadigma?' : 'What is Nomadigma?'}
          </h2>
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p>
              {locale === 'es' ? (
                <>
                  Nomadigma nació de una pregunta:{' '}
                  <br />
                  <span className="font-semibold text-foreground">
                    ¿Qué pasa si dejamos de ser turistas y empezamos a ser puentes?
                  </span>
                </>
              ) : (
                <>
                  Nomadigma was born from a question:{' '}
                  <br />
                  <span className="font-semibold text-foreground">
                    What if we stop being tourists and start being bridges?
                  </span>
                </>
              )}
            </p>
            <p>
              {locale === 'es' 
                ? 'Esta comunidad es para quienes buscan que cada kilómetro recorrido deje una huella en ellos y en el mundo.'
                : 'This community is for those who seek that every kilometer traveled leaves a mark on them and on the world.'}
            </p>
            <p className="text-foreground font-medium">
              {locale === 'es' 
                ? 'Aquí no vendemos destinos, compartimos una forma de vivir.'
                : 'Here we don\'t sell destinations, we share a way of living.'}
            </p>
            <p className="text-foreground font-medium">
              {joinText}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <Button 
              size="lg" 
              onClick={handleJoinClick}
              disabled={isLoading}
              className="text-lg px-8 py-6 gap-2"
            >
              {buttonIcon}
              {buttonText}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

