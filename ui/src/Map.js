import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import { buildDialog, renderRing } from './utils';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

const Map = () => {
  const mapContainerRef = useRef(null);

  const [lng, setLng] = useState(5);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(1.5);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // add move handler to update position panel
    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    map.on('load', function () {
      var features = [];
      var min = Number.MAX_SAFE_INTEGER;
      var max = 0;
      var totalFunding = 0;
      for (var i = 0; i < 10000; i++) {
        var random = Math.random() * (10000 - 1000) + 1000;
        totalFunding += random;
        if (random < min)
          min = random
        if (random > max)
          max = random
        features[i] = {
            "type": "Feature", 
            "properties": { 
              "id": i,
              "time": 1507425650893,
              "countryName": "Philippines",
              "townName": "Liwan Sur",
              "loanAmount": random,
              "fundedAmount": random
            }, 
            "geometry": { 
              "type": "Point", 
              "coordinates": [ Math.random() * (150 - 30) + 30,
                                Math.random() * (150 - 30) + 30 ] 
            }   
        }
      }
      
      var middle = 1.6 * ((max - min) / 2)
      const featureCollection = {
        "type": "FeatureCollection",
        "features": features
      }

      var low = ['<', ['get', 'fundedAmount'], middle];
      var high = ['>=', ['get', 'fundedAmount'], middle];

      // Add a geojson point source.
      map.addSource('kiva-loans', {
          'type': 'geojson',
          'data': featureCollection,
          'cluster': true,
          'clusterRadius': 80,
          'clusterProperties': {
              // keep separate counts for each magnitude category in a cluster
              'low': ['+', ['case', low, 1, 0]],
              'high': ['+', ['case', high, 1, 0]],
              'fundedAmount': ['+', ['get', 'fundedAmount']],
          }
      });

      // colors to use for the categories
      var colors = ['#f26375', '#acf0a5'];
    
      // circle and symbol layers for rendering individual loans (unclustered points)
      map.addLayer({
          'id': 'loan_clusters',
          'type': 'circle',
          'source': 'kiva-loans',
          'filter': ['!=', 'cluster', true],
          'paint': {
              'circle-color': [
                  'case',
                  low,
                  colors[0],
                  high,
                  colors[1],
                  colors[1]
              ],
              'circle-opacity': 0.6,
              'circle-radius': 12
          }
        });
      map.addLayer({
          'id': 'loan_dots',
          'type': 'symbol',
          'source': 'kiva-loans',
          'filter': ['!=', 'cluster', true],
          'layout': {
              'text-field': [
                  'number-format',
                  ['get', 'fundedAmount'],
                  { 'min-fraction-digits': 1, 'max-fraction-digits': 1 }
              ],
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              'text-size': 10
          },
          'paint': {
              'text-color': 'white'
          }
      });

      // objects for caching and keeping track of HTML marker objects (for performance)
      var markers = {};
      var markersOnScreen = {};

      function updateMarkers() {
          var newMarkers = {};
          var features = map.querySourceFeatures('kiva-loans');

          // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
          // and add it to the map if it's not there already
          for (var i = 0; i < features.length; i++) {
              var coords = features[i].geometry.coordinates;
              var props = features[i].properties;
              if (!props.cluster) continue;
              var id = props.cluster_id;

              var marker = markers[id];
              if (!marker) {
                  var el = renderRing(props, features.length, totalFunding, colors);
                  marker = markers[id] = new mapboxgl.Marker({
                      element: el
                  }).setLngLat(coords);
              }
              newMarkers[id] = marker;

              if (!markersOnScreen[id]) marker.addTo(map);
          }
          // for every marker we've added previously, remove those that are no longer visible
          for (id in markersOnScreen) {
              if (!newMarkers[id]) markersOnScreen[id].remove();
          }
          markersOnScreen = newMarkers;
      }

      // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
      map.on('data', function (e) {
          if (e.sourceId !== 'kiva-loans' || !e.isSourceLoaded) return;
          map.on('move', updateMarkers);
          map.on('moveend', updateMarkers);
          updateMarkers();
      });

      map.on('click', 'loan_dots', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        
        const placeholder = document.createElement('div');
        ReactDOM.render(buildDialog(e.features[0].properties), placeholder);
         
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
         
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setDOMContent(placeholder)
          .addTo(map);
      });
         
      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'loan_dots', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
         
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'loan_dots', function () {
        map.getCanvas().style.cursor = '';
      });
        
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          <p><b>STARGATE  &#94; Colonel Jack</b></p>  
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;