'use client';

import { motion } from 'framer-motion';
import { Youtube, Instagram, Mail } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/tiktok-icon';

const Footer = () => {
  const socialLinks = [
    { icon: Youtube, href: 'https://youtube.com/@nomadigma', label: 'YouTube', color: 'hover:text-red-600 dark:hover:text-red-400' },
    { icon: TikTokIcon, href: 'https://tiktok.com/@nomadigma', label: 'TikTok', color: 'hover:text-black dark:hover:text-white' },
    { icon: Instagram, href: 'https://www.instagram.com/nomadigma.travel/#', label: 'Instagram', color: 'hover:text-pink-600 dark:hover:text-pink-400' },
    { icon: Mail, href: 'mailto:nomadigma@gmail.com', label: 'Email', color: 'hover:text-indigo-600 dark:hover:text-indigo-400' },
  ];

  return (
    <footer className="bg-background relative overflow-hidden border-t border-border/50">
      <div className="container px-2 mx-auto py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright - Left */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-muted-foreground text-sm"
          >
            © 2025 Nomadigma. Todos los derechos reservados.
          </motion.p>

          {/* Síguenos - Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`size-10 border-2 border-border/60 text-muted-foreground rounded-full flex items-center justify-center ${social.color} hover:border-current transition-colors duration-150`}
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
