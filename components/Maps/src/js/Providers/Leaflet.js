/** @module Maps/Providers/Leaflet */

import { Coordinate } from '@yext/components-geo';
import { MapProviderOptions } from '../MapProvider.js';
import { ProviderMap } from '../ProviderMap.js';
import { ProviderPin } from '../ProviderPin.js';

// Map Class

/**
 * @implements {ProviderMap}
 */
class LeafletMap extends ProviderMap {
  /**
   * @param {ProviderMapOptions} options
   */
  constructor(options) {
    super(options);

    this._initMap(options);

    if (options.controlEnabled) {
      this.map.zoomControl.setPosition('topright');
    }

    this.map.on('movestart', () => this._panStartHandler());
    this.map.on('moveend', () => this._panHandler());
  }

  getCenter() {
    return new Coordinate(this.map.getCenter());
  }

  getZoom() {
    return this.map.getZoom();
  }

  setCenter(coordinate, animated) {
    const latLng = new L.latLng(coordinate.latitude, coordinate.longitude);

    this.map.panTo(latLng, { animate: animated });
  }

  setZoom(zoom, animated) {
    this.map.setZoom(zoom, { animate: animated });
  }

  setZoomCenter(zoom, center, animated) {
    const latLng = new L.latLng(center.latitude, center.longitude);

    this.map.setView(latLng, zoom, { animate: animated });
  }

  _initMap(options) {
    // We need to setZoom on map init because otherwise it will default
    // to zoom = undefined and will try to load infinite map tiles.
    // This setZoom is immediately overridden by Map.constructor()
    this.map = new L.map(options.wrapper, {
      boxZoom: options.controlEnabled,
      doubleClickZoom: options.controlEnabled,
      dragging: options.controlEnabled,
      zoom: 0,
      zoomControl: options.controlEnabled,
      zoomSnap: 0,
      ...options.providerOptions
    });

    const params = options.providerOptions;
    const tileLayerSrc = params.tileLayerSrc || 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
    const tileLayerConfig = params.tileLayerOptions || {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11',
    };

    tileLayerConfig.accessToken = this.constructor.apiKey;

    L.tileLayer(tileLayerSrc, tileLayerConfig).addTo(this.map);
  }
}

// Pin Class

/**
 * @implements {ProviderPin}
 * @todo GENERATOR TODO Full HTML pin support {@link https://leafletjs.com/reference-1.6.0.html#popup}
 */
class LeafletPin extends ProviderPin {
  /**
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    super(options);

    this.pin = new L.marker();

    this.pin.on('click', () => this._clickHandler());
    this.pin.on('mouseover', () => this._hoverHandler(true));
    this.pin.on('mouseout', () => this._hoverHandler(false));
    // GENERATOR TODO focus handler (after HTML pin support)
  }

  setCoordinate(coordinate) {
    const latLng = new L.latLng(coordinate.latitude, coordinate.longitude);
    this.pin.setLatLng(latLng);
  }

  setMap(newMap, currentMap) {
    if (newMap) {
      this.pin.addTo(newMap.getProviderMap().map);
    } else {
      this.pin.remove();
    }
  }

  setProperties(pinProperties) {
    const width = pinProperties.getWidth();
    const height = pinProperties.getHeight();
    const anchorX = pinProperties.getAnchorX();
    const anchorY = pinProperties.getAnchorY();

    this.pin.setIcon(new L.icon({
      iconUrl: this._icons[pinProperties.getIcon()],
      iconSize: [width, height],
      iconAnchor: [anchorX * width, anchorY * height],
      className: pinProperties.getClass()
    }));
    this.pin.setZIndexOffset(pinProperties.getZIndex());
  }
}

// Load Function

/**
 * This function is called when calling {@link MapProvider#load} on {@link module:Maps/Providers/Leaflet.LeafletMaps}.
 * @param {function} resolve Callback with no arguments called when the load finishes successfully
 * @param {function} reject Callback with no arguments called when the load fails
 * @param {string} apiKey Provider API key
 * @param {string} [options.version='1.7.1'] API version
 * @see {MapProvider~loadFunction}
 */
function load(resolve, reject, apiKey, {
  version = '1.7.1'
} = {}) {
  const baseUrl = `https://unpkg.com/leaflet@${version}/dist/leaflet`;

  LeafletMap.apiKey = apiKey;

  const mapStyle = document.createElement('link');
  mapStyle.rel = 'stylesheet';
  mapStyle.href = baseUrl + '.css';

  const mapScript = document.createElement('script');
  mapScript.src = baseUrl + '.js';
  mapScript.onload = () => resolve();

  document.head.appendChild(mapStyle);
  document.head.appendChild(mapScript);
}

// Exports

/**
 * @static
 * @type {MapProvider}
 */
const LeafletMaps = new MapProviderOptions()
  .withLoadFunction(load)
  .withMapClass(LeafletMap)
  .withPinClass(LeafletPin)
  .withProviderName('Leaflet')
  .build();

export {
  LeafletMaps
};
