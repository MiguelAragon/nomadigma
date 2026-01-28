'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn('w-full mx-auto px-4 lg:px-6 max-w-7xl pt-20', className)}
    >
      {children}
    </div>
  );
}

