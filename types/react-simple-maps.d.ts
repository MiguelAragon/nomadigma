declare module 'react-simple-maps' {
  import { ComponentType, SVGProps } from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      rotate?: [number, number, number];
      scale?: number;
      center?: [number, number];
    };
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: {
      geographies: any[];
      projection: any;
      outline: any;
    }) => React.ReactNode;
    parseGeographies?: (geographies: any) => any[];
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: any;
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void;
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void;
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (args: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (args: { coordinates: [number, number]; zoom: number }) => void;
    onMoveEnd?: (args: { coordinates: [number, number]; zoom: number }) => void;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}

