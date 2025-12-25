'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { YouTubeFeed } from '@/components/home/youtube-feed';
import { ReelsMural } from '@/components/home/reels-mural';
import { PhilosophySection } from '@/components/home/philosophy-section';
import { LatestPostsSection } from '@/components/home/latest-posts-section';
import { RotatingWords } from '@/components/rotating-words';

export default function HomePage() {
	const { locale } = useTranslation();
	
	// Textos según el idioma
	const heroTexts = locale === 'es' 
		? {
				firstWord: 'Viajar es',
				rotatingWords: ['sentir', 'conectar', 'crecer', 'descubrir', 'ser libre', 'experimentar'],
				description: 'Historias, consejos y experiencias de viajeros alrededor del mundo'
			}
		: {
				firstWord: 'Travel is',
				rotatingWords: ['feeling', 'connecting', 'growing', 'discovering', 'being free', 'experimenting'],
				description: 'Stories, tips and experiences from travelers around the world'
			};

	return (
		<>
			{/* Hero Section */}
			<section className="relative pt-24 pb-12 px-6 overflow-hidden min-h-[400px] flex items-center">
				<div className="absolute inset-0 z-0 overflow-hidden">
					<img 
						src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop&crop=center"
						alt="Beautiful travel destination"
						className="w-full h-full object-cover"
						style={{ objectPosition: 'center center' }}
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 via-transparent to-purple-900/10"></div>
				</div>

				<div className="container mx-auto max-w-6xl relative z-[20]">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
						className="text-center"
					>
						<div className="mb-6">
							<RotatingWords
								firstWord={heroTexts.firstWord}
								rotatingWords={heroTexts.rotatingWords}
							/>
						</div>
						<p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
							{heroTexts.description}
						</p>
					</motion.div>
				</div>
			</section>

			{/* Latest Posts Section - Right after hero */}
			<LatestPostsSection />

			<YouTubeFeed />
			<ReelsMural />
			<PhilosophySection />
		</>		
	);
}

