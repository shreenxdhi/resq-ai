import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

declare module 'leaflet' {
  interface IconOptions {
    _getIconUrl?: string;
  }
}

// Fix default marker icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  children,
  className = '',
  style = { height: '100%', width: '100%' }
}) => {
  return (
    <div className={className} style={style}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        zoomControl={false}
        style={style}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="topright" />
        {children}
      </MapContainer>
    </div>
  );
};

export const ChangeMapView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

export const createCustomIcon = (color: string): L.Icon => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export const markerIcons = {
  high: createCustomIcon('red'),
  medium: createCustomIcon('orange'),
  low: createCustomIcon('green'),
  default: createCustomIcon('blue')
} as const;
