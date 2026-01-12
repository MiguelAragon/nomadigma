'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, ArrowDown, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import Header from '@/components/header';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AboutMePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const parallaxRefs = useRef<(HTMLElement | null)[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const nextBackgroundRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storySections = [
    {
      id: 'intro',
      title: 'Nomadigma',
      titleComponent: (() => {
        return (
          <div className="w-full max-w-[600px] mx-auto">
            <Image 
              src="/nomadigma-white.png" 
              alt="Nomadigma" 
              width={1000} 
              height={1000}
              className="w-full h-auto object-contain"
              priority
            />  
          </div>
        )
      }),
      subtitle: 'Nomadigma nació de ese salto al vacío: la idea de vivir sin fronteras y hacer del mundo nuestro hogar.',
      image: '/slides/slide1.jpg',
      content: () => (null)
    },
    {
      id: 'purpose',
      title: 'El Propósito',
      subtitle: 'Nomadigma busca inspirar y conectar a quienes viajan o desean comenzar su viaje. Una comunidad que acompaña a perder el miedo, compartir experiencias y descubrir el mundo con confianza.',
      image: '/slides/slide2.jpg',
      content: () => (null)
    },
    {
      id: 'journey',
      title: 'El Viaje',
      subtitle: 'Viajar no es solo conocer lugares, es aprender, soltar miedos y abrirse al mundo, conectar con personas y vivir experiencias jamas conocidas.',
      image: '/slides/slide3.jpg',
      content: () => (null)
    },
    {
      id: 'creation',
      title: 'La Creación',
      subtitle: 'De esas experiencias nace Nomadigma: una comunidad abierta a todos, donde cada viajero puede compartir sus historias, consejos y aprendizajes. Un espacio de apoyo e inspiración para quienes desean comenzar su viaje y perder el miedo a descubrir el mundo.',
      image: '/slides/slide4.jpg',
      content: () => (null)
    },
    {
      id: 'outro',
      title: 'Únete',
      subtitle: 'Así que si estás preparado o tienes ganas de vivir experiencias únicas, únete a la comunidad.',
      image: '/slides/slide6.jpg',
      content: () => (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button 
              asChild
              variant="secondary" 
              size="lg" 
              className="mt-6 mb-10 bg-black/80 hover:bg-black/95 border border-white/30 hover:border-white/50 text-white font-semibold px-10 py-6 rounded-lg transition-all duration-300 group"
            >
              <Link href="/signup">
                <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Únete a la Comunidad
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-5 mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Avatar className="w-20 h-20 border-2 border-white/30 rounded-full">
                <AvatarImage 
                  src="/slides/avatar.jpg"
                  alt="Mike"
                />
                <AvatarFallback className="bg-white/20 text-white text-xl">M</AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="text-left">
              <p className="text-xl font-semibold mb-1">Miguel Angel Aragón</p>
              <p className="text-sm opacity-90">CEO & Founder Nomadigma</p>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  // Preload all background images
  useEffect(() => {
    const preloadImages = () => {
      let loadedCount = 0;
      const totalImages = storySections.length;
      
      storySections.forEach((section) => {
        const img = new window.Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.src = section.image;
      });
    };
    preloadImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionsRef.current) {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Calculate current section
        const sectionIndex = Math.floor((scrollPosition + windowHeight * 0.3) / windowHeight);
        const newSection = Math.min(sectionIndex, storySections.length - 1);
        setCurrentSection(newSection);

        // Calculate wipe progress for cinematic transition (line going down)
        const sectionStart = sectionIndex * windowHeight;
        const sectionScroll = scrollPosition - sectionStart;
        const progress = Math.min(100, Math.max(0, (sectionScroll / windowHeight) * 100));
        setWipeProgress(progress);

        // Background transition with wipe effect
        const newBackgroundIndex = Math.min(sectionIndex, storySections.length - 1);
        if (newBackgroundIndex !== backgroundIndex) {
          setBackgroundIndex(newBackgroundIndex);
        }

        // Simple fade for text - no fancy effects
        parallaxRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const sectionCenter = sectionTop + sectionHeight / 2;
            const viewportCenter = windowHeight / 2;
            
            const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
            const maxDistance = windowHeight * 0.5;
            
            let fadeProgress = 1 - (distanceFromCenter / maxDistance);
            fadeProgress = Math.max(0, Math.min(1, fadeProgress));
            
            const textElement = ref.querySelector('.parallax-text') as HTMLElement;
            if (textElement) {
              textElement.style.opacity = fadeProgress.toString();
            }
          }
        });
      }
    };

    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [backgroundIndex, isTransitioning]);

  const scrollToSection = (index: number) => {
    const windowHeight = window.innerHeight;
    const targetPosition = index * windowHeight;
    
    // Smooth scroll with easing
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start: number | null = null;

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animateScroll = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };


  useEffect(() => {
    // Make header transparent for this page
    const header = document.querySelector('header');
    if (header) {
      header.style.background = 'transparent';
      header.style.backdropFilter = 'none';
      
      // Make all text white
      const headerElements = header.querySelectorAll('a, button, span, p, div');
      headerElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.classList.contains('text-indigo')) {
          htmlEl.style.color = 'white';
        }
      });
    }
    
    // Ensure body and html have black background
    document.body.style.background = 'black';
    document.documentElement.style.background = 'black';
    
    return () => {
      // Reset on unmount
      if (header) {
        header.style.background = '';
        header.style.backdropFilter = '';
      }
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Transparent Header Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      
      {/* Loading Indicator */}
      <AnimatePresence>
        {!imagesLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white text-xl flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Cargando imágenes...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Background Layer with Wipe Transition */}
      <div className="fixed inset-0 z-0">
        {/* Base black background */}
        <div className="absolute inset-0 bg-black z-0" />
        
        {/* Current Background - always visible, being wiped away during transition */}
        <div
          ref={backgroundRef}
          className="absolute inset-0"
          style={{
            zIndex: 1,
            backgroundImage: `url(${storySections[backgroundIndex]?.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            clipPath: wipeProgress > 0 && currentSection === backgroundIndex ? `inset(${wipeProgress}% 0 0 0)` : 'none',
            WebkitClipPath: wipeProgress > 0 && currentSection === backgroundIndex ? `inset(${wipeProgress}% 0 0 0)` : 'none',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Next Background - being revealed from top during transition */}
        {backgroundIndex < storySections.length - 1 && wipeProgress > 5 && currentSection === backgroundIndex && (
          <div
            ref={nextBackgroundRef}
            className="absolute inset-0"
            style={{
              zIndex: 1,
              backgroundImage: `url(${storySections[backgroundIndex + 1]?.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              clipPath: `inset(0 0 ${100 - wipeProgress}% 0)`,
              WebkitClipPath: `inset(0 0 ${100 - wipeProgress}% 0)`,
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        
        {/* Film grain overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
        
        {/* Wipe line effect - subtle line that moves down */}
        {wipeProgress > 0 && wipeProgress < 100 && currentSection === backgroundIndex && (
          <div
            className="absolute left-0 right-0 h-px bg-white/30 z-20"
            style={{
              top: `${wipeProgress}%`,
              transform: 'translateY(-50%)',
              boxShadow: '0 0 8px rgba(255,255,255,0.2)',
            }}
          />
        )}
      </div>
    
      {/* Enhanced Story Navigation */}
      <div className="fixed top-1/2 right-6 md:right-8 transform -translate-y-1/2 z-40 hidden sm:block">
        <div className="flex flex-col space-y-3">
          {storySections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              className="group relative flex items-center"
              title={section.title}
            >
              {/* Label on hover */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-6 mr-2 whitespace-nowrap text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {section.title}
              </motion.div>
              
              {/* Simple dot indicator */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  currentSection === index 
                    ? 'bg-white w-2.5 h-2.5' 
                    : 'bg-white/50 w-2 h-2 group-hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Story Sections */}
      <div ref={sectionsRef} className="relative z-10">
        {storySections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className="relative h-screen flex items-center justify-center overflow-hidden snap-start"
            ref={(el) => {
              parallaxRefs.current[index] = el;
            }}
          >
            {/* Content Overlay - Simple and Authentic */}
            <div className="parallax-text relative z-10 text-center text-white max-w-4xl mx-auto px-6">
              <div className="mb-8">
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight">
                  {section.titleComponent ? section.titleComponent() : section.title}
                </h2>
                
                <div className="w-24 h-px bg-white/50 mx-auto mb-8" />
                
                <p className="content-text text-lg sm:text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto font-light">
                  {section.subtitle}
                </p>
              </div>
              
              <div>
                {section.content()}
              </div>
            </div>
          </section>
        ))}
        
        {/* Enhanced Scroll Down Button */}
        {currentSection < storySections.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="scroll-down-button flex justify-center fixed bottom-8 left-0 right-0 z-40 pointer-events-none"
          >
            <motion.button
              onClick={() => scrollToSection(currentSection + 1)}
              className="group relative w-12 h-12 flex items-center justify-center transition-all duration-300 overflow-hidden rounded-full bg-black/40 border border-white/30 hover:bg-black/60 pointer-events-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
              
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

