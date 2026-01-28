'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Globe, 
  ZoomIn, 
  ZoomOut
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Container } from '@/components/ui/container';

// World map topology data URL
const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

// Continentes en inglés (clave para las coordenadas)
const continentKeys = ["All", "Asia", "Europe", "North America", "South America", "Africa", "Oceania"];

// Traducciones de continentes
const continentTranslations: Record<string, { es: string; en: string }> = {
  "All": { es: "Todos", en: "All" },
  "Asia": { es: "Asia", en: "Asia" },
  "Europe": { es: "Europa", en: "Europe" },
  "North America": { es: "América del Norte", en: "North America" },
  "South America": { es: "América del Sur", en: "South America" },
  "Africa": { es: "África", en: "Africa" },
  "Oceania": { es: "Oceanía", en: "Oceania" },
};

// Coordenadas centrales y zoom para cada continente
const continentCoordinates: Record<string, { center: [number, number]; zoom: number }> = {
  "Asia": { center: [100, 30], zoom: 2.5 },
  "Europe": { center: [15, 50], zoom: 3 },
  "North America": { center: [-100, 40], zoom: 2 },
  "South America": { center: [-60, -20], zoom: 2.5 },
  "Africa": { center: [20, 0], zoom: 2.5 },
  "Oceania": { center: [135, -25], zoom: 3 },
};

export default function DestinationsPage() {
  const { locale } = useTranslation();
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20]);
  const [mapZoom, setMapZoom] = useState(1);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const handleContinentClick = (continent: string) => {
    setSelectedContinent(continent);
    if (continent === 'All') {
      setMapCenter([0, 20]);
      setMapZoom(1);
    } else {
      const coords = continentCoordinates[continent];
      if (coords) {
        setMapCenter(coords.center);
        setMapZoom(coords.zoom);
      }
    }
  };

  const handleZoomIn = () => {
    setMapZoom(Math.min(mapZoom * 1.5, 8));
  };

  const handleZoomOut = () => {
    setMapZoom(Math.max(mapZoom / 1.5, 0.5));
  };

  const resetMapView = () => {
    setMapCenter([0, 20]);
    setMapZoom(1);
  };

  return (
    <Container className="bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-8">

          {/* Continent Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  {locale === 'es' ? 'Continente:' : 'Continent:'}
                </span>
                {continentKeys.map((continentKey) => {
                  const continentName = continentTranslations[continentKey][locale as 'es' | 'en'] || continentKey;
                  return (
                  <Button
                      key={continentKey}
                      variant={selectedContinent === continentKey ? 'default' : 'outline'}
                    size="sm"
                      onClick={() => handleContinentClick(continentKey)}
                    className="text-xs"
                  >
                      {continentName}
                  </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`mb-8 relative ${isMapExpanded ? 'fixed inset-0 z-[9999] bg-background' : ''}`}
          >
            <div className={`w-full ${isMapExpanded ? 'h-screen' : 'h-[600px]'} bg-background rounded-xl border-2 border-border overflow-hidden relative`}>
              {/* Map Instructions
              <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold">
                    {locale === 'es' ? 'Mapa Interactivo' : 'Interactive Map'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {locale === 'es' ? 'Selecciona un continente para explorar' : 'Select a continent to explore'}
                </p>
              </div> */}

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0 shadow-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0 shadow-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={resetMapView}
                  className="h-8 w-8 p-0 shadow-lg"
                  title="Reset View"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>

              <ComposableMap
                projection="geoNaturalEarth1"
                projectionConfig={{ scale: 200 }}
                style={{ width: "100%", height: "100%" }}
              >
                <ZoomableGroup center={mapCenter} zoom={mapZoom}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }: { geographies: any[] }) =>
                      geographies.map((geo: any) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#dbeafe"
                          stroke="#93c5fd"
                          strokeWidth={0.5}
                          className="hover:fill-[#bfdbfe] active:fill-[#93c5fd] transition-colors outline-none"
                        />
                      ))
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            </div>
          </motion.div>
      </section>
    </Container>
  );
}

