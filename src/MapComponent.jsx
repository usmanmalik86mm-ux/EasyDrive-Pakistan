import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({
  center = [67.0300, 24.8138], // Clifton / Dolmen Mall area Karachi
  zoom = 12.5,
  height = '240px',
  showRoute = true
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap'
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center,
      zoom
    });

    map.current.on('load', () => {
      const pickupCoord = [67.0245, 24.8105];  // Clifton
      const dropoffCoord = [67.0345, 24.8175]; // Dolmen Mall Clifton

      new maplibregl.Marker({ color: '#16a34a' })
        .setLngLat(pickupCoord)
        .addTo(map.current);

      new maplibregl.Marker({ color: '#dc2626' })
        .setLngLat(dropoffCoord)
        .addTo(map.current);

      if (showRoute) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [pickupCoord, [67.0295, 24.8140], dropoffCoord]
            }
          }
        });

        map.current.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#15803d',
            'line-width': 4
          }
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height,
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid #dcfce7'
      }}
    />
  );
}
