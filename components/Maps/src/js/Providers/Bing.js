/** @module Maps/Providers/Bing */

import { Coordinate } from '@yext/components-geo';
import { LoadScript } from '@yext/components-performance';
import { MapProviderOptions } from '../MapProvider.js';
import { ProviderMap } from '../ProviderMap.js';
import { HTMLProviderPin } from '../ProviderPin.js';

// Map Class

// CustomOverlay for HTML Pins
let PinOverlay;

function initPinOverlayClass() {
  class PinOverlayClass extends Microsoft.Maps.CustomOverlay {
    constructor() {
      super({ beneathLabels: false });

      this._container = document.createElement('div');
      this._map = null;
      this._pins = new Set();
      this._viewChangeEventHandler = null;

      this._container.style.position = 'absolute';
      this._container.style.left = '0';
      this._container.style.top = '0';
    }

    addPin(pin) {
      this._pins.add(pin);
      this._container.appendChild(pin._wrapper);

      if (this._map) {
        this.updatePinPosition(pin);
      }
    }

    onAdd() {
      this._map = this.getMap();
      this.setHtmlElement(this._container);
    }

    onLoad() {
      this._viewChangeEventHandler = Microsoft.Maps.Events.addHandler(this._map, 'viewchange', () => this.updatePinPositions());
      this.updatePinPositions();
    }

    onRemove() {
      Microsoft.Maps.Events.removeHandler(this._viewChangeEventHandler);
      this._map = null;
    }

    removePin(pin) {
      this._pins.delete(pin);
      this._container.removeChild(pin._wrapper);
    }

    updatePinPosition(pin) {
      if (!this._map) {
        return;
      }

      const topLeft = this._map.tryLocationToPixel(pin._location, Microsoft.Maps.PixelReference.control);
      pin._wrapper.style.left = topLeft.x + 'px';
      pin._wrapper.style.top = topLeft.y + 'px';
    }

    updatePinPositions() {
      this._pins.forEach(pin => this.updatePinPosition(pin));
    }
  }

  PinOverlay = PinOverlayClass;
}

/**
 * @implements {ProviderMap}
 */
class BingMap extends ProviderMap {
  /**
   * @param {ProviderMapOptions} options
   */
  constructor(options) {
    super(options);

    this.wrapper = options.wrapper;
    this.map = new Microsoft.Maps.Map(this.wrapper, {
      disablePanning: !options.controlEnabled,
      disableZooming: !options.controlEnabled,
      showLocateMeButton: false,
      showMapTypeSelector: false,
      showScalebar: false,
      showTrafficButton: false,
      ...options.providerOptions
    });

    this.pinOverlay = new PinOverlay(this.map);
    this.map.layers.insert(this.pinOverlay);

    Microsoft.Maps.Events.addHandler(this.map, 'viewchangestart', () => this._panStartHandler());
    Microsoft.Maps.Events.addHandler(this.map, 'viewchangeend', () => this._panHandler());
  }

  getCenter() {
    return new Coordinate(this.map.getCenter());
  }

  getZoom() {
    return this.map.getZoom();
  }

  setCenter(coordinate, animated) {
    const center = new Microsoft.Maps.Location(coordinate.latitude, coordinate.longitude);
    this.map.setView({ center });
    this.pinOverlay.updatePinPositions();
  }

  setZoom(zoom, animated) {
    // Bing only allows integer zoom
    this.map.setView({ zoom: Math.floor(zoom) });
    this.pinOverlay.updatePinPositions();
  }
}

// Pin Class

/**
 * @implements {HTMLProviderPin}
 */
class BingPin extends HTMLProviderPin {
  /**
   * Bing pins need global callbacks to complete initialization.
   * This function provides a unique ID to include in the name of the callback.
   * @returns {number} An ID for the pin unique across all instances of BingPin
   */
  static getId() {
    this._pinId = (this._pinId || 0) + 1;
    return this._pinId;
  }

  /**
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    super(options);

    this._map = null;
    this._location = new Microsoft.Maps.Location(0, 0);
  }

  setCoordinate(coordinate) {
    this._location = new Microsoft.Maps.Location(coordinate.latitude, coordinate.longitude);

    if (this._map) {
      this._map.getProviderMap().pinOverlay.updatePinPosition(this);
    }
  }

  setMap(newMap, currentMap) {
    if (currentMap) {
      currentMap.getProviderMap().pinOverlay.removePin(this);
    }

    if (newMap) {
      newMap.getProviderMap().pinOverlay.addPin(this);
    }

    this._map = newMap;
  }
}

// Load Function

// Random token obtained from `echo BingMapsCallbackYext | md5 | cut -c -8`
const globalCallback = 'BingMapsCallback_593d7d33';
const baseUrl = 'https://www.bing.com/api/maps/mapcontrol';

/**
 * This function is called when calling {@link MapProvider#load} on {@link module:Maps/Providers/Bing.BingMaps}.
 * @param {function} resolve Callback with no arguments called when the load finishes successfully
 * @param {function} reject Callback with no arguments called when the load fails
 * @param {string} apiKey Provider API key
 * @param {Object} options Additional provider-specific options
 * @param {Object<string,string>} [options.params={}] Additional API params
 * @see {MapProvider~loadFunction}
 */
function load(resolve, reject, apiKey, {
  params = {}
} = {}) {
  window[globalCallback] = () => {
    initPinOverlayClass();
    resolve();
  };

  const apiParams = {
    callback: globalCallback,
    key: apiKey,
    ...params
  };

  LoadScript(baseUrl + '?' + Object.entries(apiParams).map(([key, value]) => key + '=' + value).join('&'));
}

// Exports

/**
 * @static
 * @type {MapProvider}
 */
const BingMaps = new MapProviderOptions()
  .withLoadFunction(load)
  .withMapClass(BingMap)
  .withPinClass(BingPin)
  .withProviderName('Bing')
  .build();

export {
  BingMaps
};
