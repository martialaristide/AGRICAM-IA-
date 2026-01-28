import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Use demo token or from env
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

mapboxgl.accessToken = MAPBOX_TOKEN;

const ParcelMap = ({ parcels = [], onParcelSelect, onPolygonCreate, editable = false, center, zoom = 10 }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default center (Côte d'Ivoire)
  const defaultCenter = center || [-5.5471, 7.5400];

  useEffect(() => {
    if (map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: defaultCenter,
        zoom: zoom,
        pitch: 0,
        bearing: 0,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add geolocation control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add parcels source
        map.current.addSource('parcels', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Add parcel fill layer
        map.current.addLayer({
          id: 'parcels-fill',
          type: 'fill',
          source: 'parcels',
          paint: {
            'fill-color': [
              'match',
              ['get', 'status'],
              'excellent', '#10b981',
              'bon', '#22c55e',
              'attention', '#f59e0b',
              '#3b82f6'
            ],
            'fill-opacity': 0.4
          }
        });

        // Add parcel outline layer
        map.current.addLayer({
          id: 'parcels-outline',
          type: 'line',
          source: 'parcels',
          paint: {
            'line-color': '#ffffff',
            'line-width': 2
          }
        });

        // Add parcel labels
        map.current.addLayer({
          id: 'parcels-labels',
          type: 'symbol',
          source: 'parcels',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-anchor': 'center'
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add click handler for parcels
        map.current.on('click', 'parcels-fill', (e) => {
          if (e.features.length > 0 && onParcelSelect) {
            onParcelSelect(e.features[0].properties);
          }
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'parcels-fill', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'parcels-fill', () => {
          map.current.getCanvas().style.cursor = '';
        });

        // Add drawing controls if editable
        if (editable) {
          draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true
            },
            defaultMode: 'simple_select'
          });
          map.current.addControl(draw.current, 'top-left');

          map.current.on('draw.create', handleDrawCreate);
          map.current.on('draw.update', handleDrawUpdate);
          map.current.on('draw.delete', handleDrawDelete);
        }
      });
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update parcels when data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const source = map.current.getSource('parcels');
    if (!source) return;

    const features = parcels.map(parcel => ({
      type: 'Feature',
      properties: {
        id: parcel.id,
        name: parcel.name,
        status: parcel.status,
        crop_type: parcel.crop_type,
        area_hectares: parcel.area_hectares
      },
      geometry: parcel.geometry || {
        type: 'Polygon',
        coordinates: [generatePolygonFromCenter(
          parcel.longitude || defaultCenter[0],
          parcel.latitude || defaultCenter[1],
          parcel.area_hectares || 1
        )]
      }
    }));

    source.setData({
      type: 'FeatureCollection',
      features
    });

    // Fit map to parcels if available
    if (features.length > 0 && features[0].geometry?.coordinates?.[0]) {
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach(feature => {
        if (feature.geometry?.coordinates?.[0]) {
          feature.geometry.coordinates[0].forEach(coord => {
            bounds.extend(coord);
          });
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [parcels, mapLoaded]);

  const handleDrawCreate = (e) => {
    if (onPolygonCreate && e.features.length > 0) {
      const feature = e.features[0];
      const area = calculatePolygonArea(feature.geometry.coordinates[0]);
      onPolygonCreate({
        geometry: feature.geometry,
        area_hectares: area
      });
    }
  };

  const handleDrawUpdate = (e) => {
    // Handle polygon update if needed
  };

  const handleDrawDelete = () => {
    // Handle polygon delete if needed
  };

  // Helper function to generate polygon from center point
  const generatePolygonFromCenter = (lng, lat, areaHectares) => {
    // Calculate approximate side length for given area in hectares
    const areaM2 = areaHectares * 10000;
    const side = Math.sqrt(areaM2);
    const deltaLng = side / (111320 * Math.cos(lat * Math.PI / 180));
    const deltaLat = side / 110540;

    return [
      [lng - deltaLng/2, lat - deltaLat/2],
      [lng + deltaLng/2, lat - deltaLat/2],
      [lng + deltaLng/2, lat + deltaLat/2],
      [lng - deltaLng/2, lat + deltaLat/2],
      [lng - deltaLng/2, lat - deltaLat/2]
    ];
  };

  // Calculate polygon area in hectares
  const calculatePolygonArea = (coordinates) => {
    if (!coordinates || coordinates.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      area += x1 * y2 - x2 * y1;
    }
    area = Math.abs(area) / 2;
    
    // Convert to hectares (approximate)
    const areaM2 = area * 111320 * 110540;
    return (areaM2 / 10000).toFixed(2);
  };

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '400px' }}
      data-testid="parcel-map"
    />
  );
};

export default ParcelMap;
