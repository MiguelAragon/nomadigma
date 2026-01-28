'use client';

import Link from 'next/link';
import { HexagonBadge } from '@/components/ui/hexagon-badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { CATEGORY_SHOP, ShopCategoryKey } from '@/config/categories';

export function Categories() {
  const { locale } = useTranslation();
  
  // Colores para los primeros 4 elementos - Paleta sutil y diferenciada
  const colorSchemes = [
    {
      // Guides - Azul
      stroke: 'stroke-blue-500/20',
      fill: 'fill-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      // Services - Verde teal (más neutro que morado)
      stroke: 'stroke-teal-500/20',
      fill: 'fill-teal-500/10',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      // Essentials - Ámbar/naranja suave (diferente del azul)
      stroke: 'stroke-amber-500/20',
      fill: 'fill-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      // Others - Gris slate (más neutro que rosa)
      stroke: 'stroke-slate-500/20',
      fill: 'fill-slate-500/10',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  ];
  
  const items = (Object.keys(CATEGORY_SHOP) as ShopCategoryKey[]).map((key, index) => {
    const categoryData = CATEGORY_SHOP[key];
    const colors = index < 4 ? colorSchemes[index] : colorSchemes[0];
    
    return {
      key: key, // Usar el key directamente (guides, services, essentials, others)
      title: categoryData[locale as 'en' | 'es'],
      description: categoryData.description[locale as 'en' | 'es'],
      stroke: colors.stroke,
      fill: colors.fill,
      icon: categoryData.icon,
      iconColor: colors.iconColor,
    };
  });

  const renderItem = (item: typeof items[0], index: number) => (
    <Link
      key={item.key}
      href={`/store/products?category=${encodeURIComponent(item.key)}`}
      className="block"
    >
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
        {/* Ripple effect background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
        </div>
        
        <CardContent className="flex items-center gap-3.5 px-5 py-2 relative z-10">
          <div className="group-hover:rotate-12 transition-transform duration-300 ease-in-out">
            <HexagonBadge
              stroke={item.stroke}
              fill={item.fill}
              size="size-[50px]"
              badge={
                <item.icon className={`text-xl ps-px ${item.iconColor} group-hover:scale-110 transition-transform duration-300`} />
              }
            />
          </div>

          <div className="flex flex-col">
            <span className="group-hover:text-primary text-md font-medium text-mono transition-colors duration-300">
              {item.title}
            </span>
            <span className="text-xs font-normal text-secondary-foreground">
              {item.description}
          </span>
        </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-2">
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </div>
  );
}

