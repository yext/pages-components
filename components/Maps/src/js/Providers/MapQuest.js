/** @module Maps/Providers/MapQuest */

import { Coordinate } from '@yext/components-geo';
import { MapProviderOptions } from '../MapProvider.js';
import { ProviderMap } from '../ProviderMap.js';
import { LeafletMaps } from './Leaflet.js';

const LeafletMap = LeafletMaps.getMapClass();
const LeafletPin = LeafletMaps.getPinClass();

// Map Class

/**
 * @extends {LeafletMap}
 */
class MapQuestMap extends LeafletMap {
  _initMap(options) {
    this.map = L.mapquest.map(options.wrapper, {
      boxZoom: options.controlEnabled,
      center: new L.latLng(0, 0),
      doubleClickZoom: options.controlEnabled,
      dragging: options.controlEnabled,
      layers: L.mapquest.tileLayer('map'),
      zoom: 0,
      zoomControl: options.controlEnabled,
      zoomSnap: 0,
      ...options.providerOptions
    });
  }
}

// Pin Class

/**
 * @extends {LeafletPin}
 */
class MapQuestPin extends LeafletPin {}

// Load Function

const yextAPIKey = 'Fmjtd%7Cluu829urnh%2Cbn%3Do5-9w1ghy';

/**
 * This function is called when calling {@link MapProvider#load} on {@link module:Maps/Providers/MapQuest.MapQuestMaps}.
 * @param {function} resolve Callback with no arguments called when the load finishes successfully
 * @param {function} reject Callback with no arguments called when the load fails
 * @param {?string} apiKey Provider API key
 * @param {string} [options.version='v1.3.2'] API version
 * @see {MapProvider~loadFunction}
 */
function load(resolve, reject, apiKey, {
  version = 'v1.3.2'
} = {}) {
  const baseUrl = `https://api.mqcdn.com/sdk/mapquest-js/${version}/mapquest-maps`;

  const mapStyle = document.createElement('link');
  mapStyle.rel = 'stylesheet';
  mapStyle.href = baseUrl + '.css';

  const mapScript = document.createElement('script');
  mapScript.src = baseUrl + '.js';
  mapScript.onload = () => {
    L.mapquest.key = apiKey || yextAPIKey;
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
const MapQuestMaps = new MapProviderOptions()
  .withLoadFunction(load)
  .withMapClass(MapQuestMap)
  .withPinClass(MapQuestPin)
  .withProviderName('MapQuest')
  .build();

export {
  MapQuestMaps
};
