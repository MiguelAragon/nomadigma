'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function HeroStatement() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video/Collage Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/slides/slide1.jpg"
          alt="Nomadigma Journey"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay oscuro para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      </div>

      {/* Contenido centrado */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo Nomadigma White */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-12 flex justify-center"
          >
            <Image
              src="/nomadigma-white.png"
              alt="Nomadigma"
              width={200}
              height={60}
              className="h-auto w-auto max-w-[200px] md:max-w-[250px]"
              priority
            />
          </motion.div>

          {/* Frase principal - Más pequeña e interesante */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl lg:text-3xl font-light italic text-white/95 leading-relaxed max-w-3xl mx-auto"
          >
            No viajamos para escapar de la vida, sino para que la vida no se nos escape.
          </motion.h1>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white/70 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

