/** @module Maps/Providers/Google */

import { Coordinate } from '@yext/components-geo';
import { LoadScript } from '@yext/components-performance';
import { MapProviderOptions } from '../MapProvider.js';
import { ProviderMap } from '../ProviderMap.js';
import { HTMLProviderPin } from '../ProviderPin.js';

/**
 * @static
 * @enum {string}
 */
const Library = {
  PLACES: 'places'
};

// Map Class

/**
 * @implements {ProviderMap}
 */
class GoogleMap extends ProviderMap {
  /**
   * @param {ProviderMapOptions} options
   */
  constructor(options) {
    super(options);

    this.map = new google.maps.Map(options.wrapper, {
      disableDefaultUI: !options.controlEnabled,
      fullscreenControl: false,
      gestureHandling: options.controlEnabled ? 'auto' : 'none',
      mapTypeControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      zoomControl: options.controlEnabled,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      ...options.providerOptions
    });

    // Google getZoom only gives integer zoom, so we have to keep track otherwise.
    this._currentZoom = null;
    this._zoomValid = true;
    this._zoomChangeListener = null;

    this._moving = false;
    google.maps.event.addListener(this.map, 'bounds_changed', () => {
      if (!this._moving) {
        this._moving = true;
        this._panStartHandler();
      }
    });
    google.maps.event.addListener(this.map, 'idle', () => {
      this._moving = false;
      this._panHandler();
    });
  }

  getCenter() {
    return new Coordinate(this.map.getCenter());
  }

  getZoom() {
    return this._zoomValid ? this.map.getZoom() : this._currentZoom;
  }

  setCenter(coordinate, animated) {
    const latLng = new google.maps.LatLng(coordinate.latitude, coordinate.longitude);

    if (animated) {
      this.map.panTo(latLng)
    } else {
      this.map.setCenter(latLng);
    }
  }

  setZoom(zoom, animated) {
    // Clear existing listener
    if (this._zoomChangeListener) {
      this._zoomChangeListener.remove();
      this._zoomChangeListener = null;
    }

    // Google will snap the zoom to an integer the next time the bounds change.
    // We need to listen for the bounds to change the next time after the zoom is set.
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () =>
      this._zoomChangeListener = google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
        this._currentZoom = this.map.getZoom();
        this._zoomValid = true;
        this._zoomChangeListener = null;
      })
    );

    this.map.setZoom(zoom);
    this._currentZoom = zoom;
    this._zoomValid = false;
  }

  setZoomCenter(zoom, center, animated) {
    this.setCenter(center, animated);
    this.setZoom(zoom, animated);
  }
}

// Pin Class

/**
 * @implements {HTMLProviderPin}
 */
class GooglePin extends HTMLProviderPin {
  /**
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    super(options);

    google.maps.OverlayView.preventMapHitsAndGesturesFrom(this._wrapper);

    const that = this;

    class CustomMarker extends google.maps.OverlayView {
      draw() {
        const position = this.getProjection()?.fromLatLngToDivPixel(that._latLng);

        if (position) {
          that._wrapper.style.left = position.x + 'px';
          that._wrapper.style.top = position.y + 'px';
        }
      }

      onAdd() {
        this.getPanes().floatPane.appendChild(that._wrapper);
      }

      onRemove() {
        that._wrapper.parentNode?.removeChild(that._wrapper);
      }
    }

    this.pin = new CustomMarker();
  }

  setCoordinate(coordinate) {
    this._latLng = new google.maps.LatLng(coordinate.latitude, coordinate.longitude);
    this.pin.draw();
  }

  setMap(newMap, currentMap) {
    this.pin.setMap(newMap ? newMap.getProviderMap().map : null);
  }
}

// Load Function

// Random token obtained from `echo GoogleMapsCallbackYext | md5 | cut -c -8`
const globalCallback = 'GoogleMapsCallback_b7d77ff2';
const baseUrl = 'https://maps.googleapis.com/maps/api/js';

/**
 * This function is called when calling {@link MapProvider#load} on {@link module:Maps/Providers/Google.GoogleMaps}.
 * @param {function} resolve Callback with no arguments called when the load finishes successfully
 * @param {function} reject Callback with no arguments called when the load fails
 * @param {string} apiKey Provider API key
 * @param {Object} options Additional provider-specific options
 * @param {boolean} [options.autocomplete=false] Whether to include Google's autocomplete API
 * @param {string} [options.channel=window.location.hostname] API key usage channel
 * @param {string} [options.client] Google API enterprise client
 * @param {string} [options.language=Yext.locale] Language of the map
 * @param {module:Maps/Providers/Google.Library[]} [options.libraries=[]] Additional Google libraries to load
 * @param {Object<string,string>} [options.params={}] Additional API params
 * @see {MapProvider~loadFunction}
 */
function load(resolve, reject, apiKey, {
  autocomplete = false,
  channel = window.location.hostname,
  client,
  language = Yext.locale,
  libraries = [],
  params = {}
} = {}) {
  window[globalCallback] = resolve;

  if (autocomplete) {
    libraries.push(Library.PLACES);
  }

  const apiParams = {
    callback: globalCallback,
    channel,
    language,
    libraries: libraries.join(','),
    ...params
  };

  if (apiKey) {
    apiParams.key = apiKey;
  }

  if (client) {
    apiParams.client = client;
  }

  LoadScript(baseUrl + '?' + Object.entries(apiParams).map(([key, value]) => key + '=' + value).join('&'));
}

// Exports

/**
 * @static
 * @type {MapProvider}
 */
const GoogleMaps = new MapProviderOptions()
  .withLoadFunction(load)
  .withMapClass(GoogleMap)
  .withPinClass(GooglePin)
  .withProviderName('Google')
  .build();

export {
  GoogleMaps,
  Library
};
