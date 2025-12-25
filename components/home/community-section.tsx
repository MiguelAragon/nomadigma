'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export function CommunitySection() {
  const { locale } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar suscripción a newsletter
    console.log('Subscribe:', email);
    setEmail('');
  };

  const sectionTitle = locale === 'es' ? 'La Conversación' : 'The Conversation';
  const sectionDescription = locale === 'es' 
    ? 'Manda tus comentarios, preguntas o reflexiones. Esta es una comunidad, no un monólogo.'
    : 'Send your comments, questions or reflections. This is a community, not a monologue.';
  const emailLabel = locale === 'es' ? 'Correo electrónico' : 'Email';
  const submitText = locale === 'es' ? 'Enviar' : 'Send';

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {sectionDescription}
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="size-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-bold">
                  {locale === 'es' ? 'Envíanos un correo' : 'Send us an email'}
                </h3>
              </div>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    {emailLabel}
                  </label>
                <Input
                    id="email"
                  type="email"
                    placeholder={locale === 'es' ? 'tu@email.com' : 'your@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  {submitText}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

