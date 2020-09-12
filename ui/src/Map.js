import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import { buildGeoFeature, buildDialog, renderRing } from './utils';
import stargate from './stargate';
import { circleLayer, textLayer } from './map/layers';
import { clusterSource } from './map/clusterSource';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

const Map = () => {
  const mapContainerRef = useRef(null);

  const [lng, setLng] = useState(5);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(1.5);


  function renderMap(features) {
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

      var min = Number.MAX_SAFE_INTEGER;
      var max = 0;
      var totalFunding = 0;
      for (var i = 0; i < features.length; i++) {
        const funded_amount = features[i].funded_amount;
        totalFunding += funded_amount;
        if (funded_amount < min)
          min = funded_amount
        if (funded_amount > max)
          max = funded_amount 
        }   
      var middle = 1.6 * ((max - min) / 2)
      const featureCollection = {
        "type": "FeatureCollection",
        "features": features
      }

    var low = ['<', ['get', 'funded_amount'], middle];
    var high = ['>=', ['get', 'funded_amount'], middle];

    // Add a geojson point source.
    map.addSource('kiva-loans', clusterSource(featureCollection, low, high));

    // colors to use for the categories
    var colors = ['#f26375', '#acf0a5'];
    
      
    // circle and symbol layers for rendering individual loans (unclustered points)
    map.addLayer(circleLayer(low, high, colors));
    map.addLayer(textLayer());
      

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
  }

  // Initialize map when component mounts
  useEffect(() => {

    
    const db = process.env.REACT_APP_ASTRA_DB_ID,
      region = process.env.REACT_APP_ASTRA_DB_REGION,
      username = process.env.REACT_APP_STARGATE_USERNAME,
      password = process.env.REACT_APP_STARGATE_PASSWORD,
      token = process.env.REACT_APP_TOKEN,
      namespace = process.env.REACT_APP_ASTRA_KEYSPACE,
      collection = process.env.REACT_APP_ASTRA_COLLECTION,
      baseQuery = `/namespaces/${namespace}/collections/${collection}/`,
      whereClause = '?where={"posted_time": { "$gte": "2000-01-01" } }';



    async function fetchDocs(ids) {
      const sg = await stargate.createClient({
        baseUrl: `https://${db}-${region}.apps.astra.datastax.com`,
        username,
        password,
      }, token);

      var promises = [];
      for (var i = 0; i < ids.length; i++) {
        promises.push(sg.get(baseQuery + ids[i]));
      }

      Promise.all(promises).then(async results => {
        var features = [];
        for (var i = 0; i < ids.length; i++) {
          const body = await results[i].json();
          features.push(buildGeoFeature(body.data));
        }
        console.log(features);
        renderMap(features);
      });
    }

    async function fetchIds() {
      const sg = await stargate.createClient({
        baseUrl: `https://${db}-${region}.apps.astra.datastax.com`,
        username,
        password,
      }, token);
      const response = await sg.get(baseQuery + whereClause);
      const body = await response.json();
      const ids = Object.keys(body.data);
      console.log(ids);
      fetchDocs(ids);
    }
    fetchIds();
    // Clean up on unmount
    // return () => map.remove();
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