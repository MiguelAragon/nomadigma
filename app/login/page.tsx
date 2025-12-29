'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background con slide1 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/slides/slide1.jpg"
          alt="Nomadigma Journey"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Curvatura de la Tierra - visualización */}
      <svg 
        className="absolute inset-0 z-5 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="earthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="35%" stopColor="rgba(0,0,0,0)" />
            <stop offset="37.5%" stopColor="rgba(0,0,0,0.1)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
          </linearGradient>
        </defs>
        {/* Curvatura de la tierra - área sombreada desde la curva hacia abajo */}
        <path
          d="M 0,37.5% Q 50%,55% 100%,37.5% L 100%,100% L 0,100% Z"
          fill="url(#earthGradient)"
        />
        {/* Línea de la curvatura (opcional, para visualización) */}
        <path
          d="M 0,37.5% Q 50%,55% 100%,37.5%"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Contenido centrado */}
      <div className="relative z-20 w-full max-w-md px-6">
        {/* Logo Nomadigma */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <Image
            src="/nomadigma-white.png"
            alt="Nomadigma"
            width={200}
            height={60}
            className="h-auto w-auto max-w-[200px]"
            priority
          />
        </motion.div>

        {/* Formulario de Clerk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SignIn 
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-2xl bg-background/95 backdrop-blur-sm border border-border',
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                headerTitle: 'text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'border-border hover:bg-accent',
                formFieldInput: 'bg-background border-border',
                formFieldLabel: 'text-foreground',
                footerActionLink: 'text-indigo-600 hover:text-indigo-700',
              }
            }}
            signUpUrl="/signup"
            fallbackRedirectUrl="/"
          />
        </motion.div>
      </div>
    </div>
  );
}

