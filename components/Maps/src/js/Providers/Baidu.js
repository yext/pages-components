/** @module Maps/Providers/Baidu */

import { Coordinate } from '@yext/components-geo';
import { MapProviderOptions } from '../MapProvider.js';
import { ProviderMap } from '../ProviderMap.js';
import { HTMLProviderPin } from '../ProviderPin.js';

// Baidu zoom formula: equatorWidth = 2^zoom * 152.87572479248047
// Our standard zoom formula: equatorWidth = 2^zoom * 256
// To convert:
// 2^bdZoom * 152.87572479248047 = 2^zoom * 256
// bdZoom = stdZoom + log2(1.6745627884839434)
const baiduZoomConversionConstant = Math.log2(1.6745627884839434);
const baiduMinZoom = 4;
const baiduMaxZoom = 19;

// Baidu renders pins with negative longitude incorrectly. This class identifies them to fix.
const negativeLngPinClass = 'js-baidu-neg-lng-fix';

// The API key is needed for coordinate conversion.
// The load function will resolve apiKeyPromise with the key once it is invoked.
let resolveAPIKey;
const apiKeyPromise = new Promise(resolve => resolveAPIKey = resolve);
const geoconvBaseUrl = 'https://api.map.baidu.com/geoconv/v1/';

// Batch coordinate conversion requests to reduce network load
let gcj02ToBD09Requests = [];
const gcj02ToBD09GlobalCallback = 'gcj02ToBD09Callback_b872c21c';
let gcj02ToBD09CallbackCounter = 0;
let gcj02ToBD09CallbackTimeout;

/**
* This function converts coordinates from China's coordinate system GCJ-02 to Baidu's coordinate
* system BD-09. See {@link https://en.wikipedia.org/wiki/Baidu_Maps#Coordinate_system} for more info.
* @static
* @async
* @param {Coordinate[]} coordinates Coordinates in the GCJ-02 coordinate system
* @returns {Coordinate[]} Equivalent coordinates in the BD-09 coordinate system
*/
async function gcj02ToBD09(coordinates) {
  return await new Promise((resolve, reject) => {
    gcj02ToBD09Requests.push({ coordinates, resolve, reject });

    if (gcj02ToBD09Requests.length == 1) {
      gcj02ToBD09CallbackTimeout = setTimeout(sendRequests, 100);
    }

    // URL length can't exceed 2000 characters and each coordinate adds at most 40 characters to the URL.
    // If approaching the limit, send the requests immediately instead of waiting for more.
    if (gcj02ToBD09Requests.length > 40) {
      clearTimeout(gcj02ToBD09CallbackTimeout);
      sendRequests();
    }

    function sendRequests() {
      const requests = gcj02ToBD09Requests;
      gcj02ToBD09Requests = [];
      const coordinates = [].concat(...(requests.map(request => request.coordinates)));
      const callback = gcj02ToBD09GlobalCallback + '_' + gcj02ToBD09CallbackCounter++;
      const script = document.createElement('script');

      window[callback] = data => {
        if (data.status) {
          const err = new Error(`Unable to convert coordinates to BD-09: Received status code ${data.status}${data.message ? ': ' + data.message : ''}`);
          requests.forEach(request => request.reject(err));
        }

        const convertedCoords = data.result.map(point => new Coordinate(point.y, point.x));
        let currentIndex = 0;

        requests.forEach(request => {
          request.resolve(convertedCoords.slice(currentIndex, currentIndex += request.coordinates.length));
        });

        delete window[callback];
        script.parentNode.removeChild(script);
      };

      apiKeyPromise.then(ak => {
        const apiParams = {
          ak,
          callback,
          coords: coordinates.map(coordinate => `${coordinate.longitude},${coordinate.latitude}`).join(';'),
          from: 3,
          to: 5
        };

        script.src = geoconvBaseUrl + '?' + Object.entries(apiParams).map(([key, value]) => key + '=' + value).join('&');
        document.head.appendChild(script);
      });
    }
  });
}

// Map Class

/**
 * Baidu Maps documentation lives here: {@link http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html}
 * @implements {ProviderMap}
 */
class BaiduMap extends ProviderMap {
  /**
   * @param {ProviderMapOptions} options
   */
  constructor(options) {
    super(options);

    const isIE11 = !!(window.MSInputMethodContext && document.documentMode);

    this._wrapper = options.wrapper;
    this.map = new BMap.Map(this._wrapper, {
      enableMapClick: options.controlEnabled,
      // A side effect of the negative pin longitude glitch is that pins don't render at higher zoom levels.
      // For IE, 15 and above is broken. For other browsers, 19 and above.
      maxZoom: isIE11 ? 14 : 18,
      ...options.providerOptions
    });

    if (options.controlEnabled) {
      this.map.enableScrollWheelZoom();
      this.map.addControl(new BMap.NavigationControl({
        anchor: BMAP_ANCHOR_TOP_RIGHT,
        type: BMAP_NAVIGATION_CONTROL_ZOOM
      }));
    } else {
      this.map.disableDragging();
      this.map.disableDoubleClickZoom();
      this.map.disablePinchToZoom();
    }

    this.map.addEventListener('movestart', () => this._panStartHandler());
    this.map.addEventListener('moveend', () => this._panHandler());
    this.map.addEventListener('zoomstart', () => this._panStartHandler());
    this.map.addEventListener('zoomend', () => {
      this._wrapper.dataset.baiduZoom = this.map.getZoom();
      this._panHandler();
    });

    // The map center has to be converted asynchronously via Baidu's API
    this._centerReady = Promise.resolve();
  }

  getCenter() {
    return new Coordinate(this.map.getCenter());
  }

  getZoom() {
    return this.map.getZoom() - baiduZoomConversionConstant;
  }

  setCenter(coordinate, animated) {
    this._centerReady = gcj02ToBD09([coordinate]).then(([convertedCoord]) => {
      const point = new BMap.Point(convertedCoord.longitude, convertedCoord.latitude);
      this.map.panTo(point, { noAnimation: !animated });
    });
  }

  setZoom(zoom, animated) {
    this._centerReady.then(() => {
      this.map.setViewport({
        center: this.map.getCenter(),
        zoom: Math.floor(zoom + baiduZoomConversionConstant) // Baidu only allows integer zoom
      }, { enableAnimation: animated });
    });
  }
}

// Pin Class

/**
 * Baidu Maps documentation lives here: {@link http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html}
 * @implements {HTMLProviderPin}
 */
class BaiduPin extends HTMLProviderPin {
  /**
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    super(options);

    this._wrapper = null;
    this._zIndex = 0;
    this._wrapperClass = '';
    this._originalWrapperClass = '';
    this._element = this._pinEl;

    // The pin coordinate has to be converted asynchronously via Baidu's API
    this._coordinateReady = Promise.resolve();
    this._negativeLngFix = false;

    const that = this;

    class CustomMarker extends BMap.Marker {
      initialize(map) {
        that._wrapper = super.initialize(map);

        if (that._wrapper) {
          that._wrapper.style.zIndex = that._zIndex;
          that._originalWrapperClass = that._wrapper.getAttribute('class');
          that._wrapper.setAttribute('class', that._getClass());
          that._wrapper.appendChild(that._element);
          that.addListeners();
        }

        return that._wrapper;
      }

      draw() {
        if (that._wrapper) {
          const zIndex = that._wrapper.style.zIndex;

          super.draw();
          that._wrapper.style.height = '';
          that._wrapper.style.width = '';
          that._wrapper.style.zIndex = zIndex;
        } else {
          super.draw();
        }
      }
    }

    this.pin = new CustomMarker(new BMap.Point(0, 0));

    // Remove the default icon and shadow by setting it to a transparent 0x0 pixel
    const hiddenIcon = new BMap.Icon('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', { height: 0, width: 0 });
    this.pin.setIcon(hiddenIcon);
    this.pin.setShadow(hiddenIcon);
  }

  addListeners() {
    super.addListeners();

    this._wrapper.addEventListener('touchend', () => this._clickHandler());
  }

  setCoordinate(coordinate) {
    this._coordinateReady = gcj02ToBD09([coordinate]).then(([convertedCoord]) => {
      // To avoid Baidu's glitched rendering of pins with negative longitude, this will set the pin to a
      // longitude exactly halfway around the world, and CSS will translate it to its correct position.
      this._negativeLngFix = convertedCoord.longitude < 0;
      this.pin.setPosition(new BMap.Point(convertedCoord.longitude + (this._negativeLngFix ? 180 : 0), convertedCoord.latitude));

      if (this._wrapper) {
        this._wrapper.classList[this._negativeLngFix ? 'add' : 'remove'](negativeLngPinClass);
      }
    });
  }

  setMap(newMap, currentMap) {
    this._coordinateReady.then(() => {
      if (currentMap) {
        currentMap.getProviderMap().map.removeOverlay(this.pin);
      }

      if (newMap) {
        newMap.getProviderMap().map.addOverlay(this.pin);
      }
    });
  }

  setProperties(pinProperties) {
    super.setProperties(pinProperties);

    this._wrapperClass = pinProperties.getClass();
    this._element = pinProperties.getElement() || this._pinEl;
    this._zIndex = pinProperties.getZIndex();

    if (this._wrapper) {
      this._wrapper.setAttribute('class', this._getClass());
    }
  }

  _getClass() {
    return `${this._originalWrapperClass} ${this._negativeLngFix ? negativeLngPinClass : ''} ${this._wrapperClass}`;
  }
}

// Load Function

const baseUrl = 'https://api.map.baidu.com/getscript';

/**
 * This function is called when calling {@link MapProvider#load} on {@link module:Maps/Providers/Baidu.BaiduMaps}.
 * @param {function} resolve Callback with no arguments called when the load finishes successfully
 * @param {function} reject Callback with no arguments called when the load fails
 * @param {string} apiKey Provider API key
 * @param {Object} options Additional provider-specific options
 * @param {Object<string,string>} [options.params={}] Additional API params
 * @param {string} [options.version='3.0'] API version
 * @see {MapProvider~loadFunction}
 */
function load(resolve, reject, apiKey, {
  params = {},
  version = '3.0'
} = {}) {
  window.BMAP_PROTOCOL = 'https';
  window.BMap_loadScriptTime = new Date().getTime();

  const key = apiKey;
  const apiParams = {
    ak: key,
    v: version,
    ...params
  };

  resolveAPIKey(key);

  const script = document.createElement('script');
  script.src = baseUrl + '?' + Object.entries(apiParams).map(([key, value]) => key + '=' + value).join('&');
  script.onload = () => resolve();

  document.head.appendChild(script);

  // Generate a style block to fix rendering of pins with negative longitude at each zoom level
  let negativeLngFixCSS = '';
  for (let i = baiduMinZoom; i <= baiduMaxZoom; i++) {
    const offset = 2 ** (i - baiduZoomConversionConstant + 7);
    negativeLngFixCSS += `[data-baidu-zoom="${i}"] .${negativeLngPinClass}{transform:translateX(-${offset}px);}`
  }

  const negativeLngFixStyle = document.createElement('style');
  negativeLngFixStyle.innerHTML = negativeLngFixCSS;

  document.head.appendChild(negativeLngFixStyle);
}

// Exports

/**
 * @static
 * @type {MapProvider}
 */
const BaiduMaps = new MapProviderOptions()
  .withLoadFunction(load)
  .withMapClass(BaiduMap)
  .withPinClass(BaiduPin)
  .withProviderName('Baidu')
  .build();

export {
  BaiduMaps,
  gcj02ToBD09
};
