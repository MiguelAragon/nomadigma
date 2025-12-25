'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Compass, Briefcase } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function DiarySection() {
  const categories = [
    { name: 'Reflexiones', icon: BookOpen, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
    { name: 'Guías Conscientes', icon: Compass, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { name: 'Nómada 2.0', icon: Briefcase, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  ];

  // Posts destacados - reemplazar con datos reales del blog
  const featuredPosts = [
    {
      id: '1',
      title: 'El propósito detrás de cada kilómetro',
      excerpt: 'Una reflexión profunda sobre qué significa realmente viajar con intención...',
      category: 'Reflexiones',
      image: '/screens/1.png',
      slug: 'el-proposito-detras-de-cada-kilometro',
    },
    {
      id: '2',
      title: 'Cómo viajar respetando el entorno',
      excerpt: 'Guía práctica para ser un viajero consciente y responsable...',
      category: 'Guías Conscientes',
      image: '/screens/2.png',
      slug: 'como-viajar-respetando-el-entorno',
    },
    {
      id: '3',
      title: 'Trabajar y viajar: la realidad del nómada digital',
      excerpt: 'La verdad sobre combinar trabajo remoto con una vida en movimiento...',
      category: 'Nómada 2.0',
      image: '/screens/3.png',
      slug: 'trabajar-y-viajar-la-realidad-del-nomada-digital',
    },
  ];

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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            El Manifiesto
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Aquí vive la profundidad. Crónicas, bitácoras y reflexiones del camino.
          </p>

          {/* Categorías */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Badge className={`${category.color} px-4 py-2 text-sm font-medium flex items-center gap-2`}>
                  <category.icon className="size-4" />
                  {category.name}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Grid de posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {featuredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group cursor-pointer">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={categories.find(c => c.name === post.category)?.color}>
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:gap-2 transition-all">
                      Leer más
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Botón para ver más */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button size="lg" variant="outline" asChild>
            <Link href="/blog" className="flex items-center gap-2">
              Ver todas las crónicas
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

