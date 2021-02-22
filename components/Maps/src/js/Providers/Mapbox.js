/** @module Maps/Providers/Mapbox */

import { Coordinate } from '@yext/components-geo';
import { MapProviderOptions } from '../MapProvider.js';
import { ProviderMap } from '../ProviderMap.js';
import { HTMLProviderPin } from '../ProviderPin.js';

// GENERATOR TODO: call map resize method when hidden/shown (CoreBev, used to be done in Core.js)

// Map Class

/**
 * @implements {ProviderMap}
 */
class MapboxMap extends ProviderMap {
  /**
   * @param {ProviderMapOptions} options
   */
  constructor(options) {
    super(options);

    this.map = new mapboxgl.Map({
      container: options.wrapper,
      interactive: options.controlEnabled,
      style: 'mapbox://styles/mapbox/streets-v9',
      ...options.providerOptions
    });

    // Add the zoom control
    if (options.controlEnabled) {
      const zoomControl = new mapboxgl.NavigationControl({ showCompass: false })
      this.map.addControl(zoomControl);
    }

    this.map.on('movestart', () => this._panStartHandler());
    this.map.on('moveend', () => this._panHandler());
  }

  getCenter() {
    return new Coordinate(this.map.getCenter());
  }

  getZoom() {
    // Our standard zoom: at level 0, the world is 256 pixels wide and doubles each level
    // Mapbox zoom: at level 0, the world is 512 pixels wide and doubles each level
    return this.map.getZoom() + 1;
  }

  setCenter(coordinate, animated) {
    const center = new mapboxgl.LngLat(coordinate.longitude, coordinate.latitude);

    this.map[animated ? 'panTo' : 'setCenter'](center);
  }

  setZoom(zoom, animated) {
    // Our standard zoom: at level 0, the world is 256 pixels wide and doubles each level
    // Mapbox zoom: at level 0, the world is 512 pixels wide and doubles each level
    this.map[animated ? 'zoomTo' : 'setZoom'](zoom - 1);
  }

  setZoomCenter(zoom, coordinate, animated) {
    const center = new mapboxgl.LngLat(coordinate.longitude, coordinate.latitude);

    // Our standard zoom: at level 0, the world is 256 pixels wide and doubles each level
    // Mapbox zoom: at level 0, the world is 512 pixels wide and doubles each level
    this.map[animated ? 'easeTo' : 'jumpTo']({ center, zoom: zoom - 1 });
  }
}

// Pin Class

/**
 * @implements {HTMLProviderPin}
 */
class MapboxPin extends HTMLProviderPin {
  /**
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    super(options);

    this.pin = new mapboxgl.Marker({
      anchor: 'top-left',
      element: this._wrapper
    });
  }

  setCoordinate(coordinate) {
    this.pin.setLngLat(new mapboxgl.LngLat(coordinate.longitude, coordinate.latitude));
  }

  setMap(newMap, currentMap) {
    if (newMap) {
      this.pin.addTo(newMap.getProviderMap().map);
    } else {
      this.pin.remove();
    }
  }
}

// Load Function

/**
 * This function is called when calling {@link MapProvider#load} on {@link module:Maps/Providers/Mapbox.MapboxMaps}.
 * @param {function} resolve Callback with no arguments called when the load finishes successfully
 * @param {function} reject Callback with no arguments called when the load fails
 * @param {?string} apiKey Provider API key
 * @param {Object} options Additional provider-specific options
 * @param {string} [options.version='v1.13.0'] API version
 * @see {MapProvider~loadFunction}
 */
function load(resolve, reject, apiKey, {
  version = 'v1.13.0'
} = {}) {
  const baseUrl = `https://api.mapbox.com/mapbox-gl-js/${version}/mapbox-gl`;

  const mapStyle = document.createElement('link');
  mapStyle.rel = 'stylesheet';
  mapStyle.href = baseUrl + '.css';

  const mapScript = document.createElement('script');
  mapScript.src = baseUrl + '.js';
  mapScript.onload = () => {
    mapboxgl.accessToken = apiKey || yextAPIKey;
    resolve();
  };

  document.head.appendChild(mapStyle);
  document.head.appendChild(mapScript);
}

// Exports

/**
 * @static
 * @type {MapProvider}
 */
const MapboxMaps = new MapProviderOptions()
  .withLoadFunction(load)
  .withMapClass(MapboxMap)
  .withPinClass(MapboxPin)
  .withProviderName('Mapbox')
  .build();

export {
  MapboxMaps
};
