import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({ center = [67.0011, 24.8607], zoom = 12 }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors'
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center: center, // Default: Karachi [Lng, Lat]
      zoom: zoom
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '300px', borderRadius: '12px' }} />;
}
