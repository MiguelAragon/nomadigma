'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const Logo = () => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 leading-0"
    >
      {/* Logo Image - Light mode: N blanca con fondo negro */}
      <div className="dark:hidden">
        <div className="bg-black p-1">
          <Image
            src="/logo-white.png"
            alt="Nomadigma"
            width={25}
            height={25}
            className="h-[25px] w-auto"
            priority
          />
        </div>
      </div>
      {/* Logo Image - Dark mode: N negra con fondo blanco */}
      <div className="hidden dark:block">
        <div className="bg-white p-1">
          <Image
            src="/logo.png"
            alt="Nomadigma"
            width={25}
            height={25}
            className="h-[25px] w-auto"
            priority
          />
        </div>
      </div>
      {/* Logo Text - Light mode: negro, Dark mode: blanco */}
      <span className="text-2xl font-bold text-black dark:text-white">
        Nomadigma
      </span>
    </motion.div>
  );
};

export default Logo;

