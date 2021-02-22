import { Type, assertType, assertInstance } from '@yext/components-util';
import { ProviderMapOptions, ProviderMap } from './ProviderMap';
import { ProviderPinOptions, ProviderPin } from './ProviderPin';

/**
 * {@link MapProvider} options class
 */
class MapProviderOptions {
  constructor() {
    this.loadFunction = (resolve, reject, apiKey, options) => resolve();
    this.mapClass = ProviderMap;
    this.pinClass = ProviderPin;
    this.providerName = '';
  }

  /**
   * @typedef MapProvider~loadFunction
   * @function
   * @param {function} resolve Callback with no arguments called when the load finishes successfully
   * @param {function} reject Callback with no arguments called when the load fails
   * @param {string} apiKey Provider API key
   * @param {Object} [options={}] Additional provider-specific options
   */

  /**
   * @param {MapProvider~loadFunction}
   * @returns {MapProviderOptions}
   */
  withLoadFunction(loadFunction) {
    assertType(loadFunction, Type.FUNCTION);

    this.loadFunction = loadFunction;
    return this;
  }

  /**
   * @param {Class.<ProviderMap>} mapClass Subclass of {@link ProviderMap} for the provider
   * @returns {MapProviderOptions}
   */
  withMapClass(mapClass) {
    this.mapClass = mapClass;
    return this;
  }

  /**
   * @param {Class.<ProviderPin>} mapClass Subclass of {@link ProviderPin} for the provider
   * @returns {MapProviderOptions}
   */
  withPinClass(pinClass) {
    this.pinClass = pinClass;
    return this;
  }

  /**
   * @param {string} providerName Name of the map provider
   * @returns {MapProviderOptions}
   */
  withProviderName(providerName) {
    this.providerName = providerName;
    return this;
  }

  /**
   * @returns {MapProvider}
   */
  build() {
    return new MapProvider(this);
  }
}

/**
 * This class is used for loading the API for a map provider such as Google Maps and creating {@link ProviderMap} and {@link ProviderPin} instances.
 * Provider map implementations return an instance of this class for their provider that you can use
 * to load the API and pass in to {@link MapOptions} and {@link MapPinOptions} objects as the provider.
 * Example using GoogleMaps, an instance of this class:
 * GoogleMaps.load().then(() => map = new MapOptions().withProvider(GoogleMaps).build());
 */
class MapProvider {
  /**
   * @param {MapProviderOptions} options
   */
  constructor(options) {
    assertInstance(options, MapProviderOptions);

    this._loadFunction = options.loadFunction;
    this._mapClass = options.mapClass;
    this._pinClass = options.pinClass;
    this._providerName = options.providerName;

    this._loadPromise = new Promise((resolve, reject) => {
      this._resolveLoad = resolve;
      this._rejectLoad = reject;
    });

    this._apiKey = '';
    this._loadInvoked = false;
    this._loaded = false;
    this._options = {};
  }

  /**
   * Returns true if the map provider has been successfully loaded
   * @type {boolean}
   */
  get loaded() {
    return this._loaded;
  }

  /**
   * @returns {ProviderMap.constructor}
   * @see {@link MapProviderOptions#withMapClass}
   */
  getMapClass() {
    return this._mapClass;
  }

  /**
   * @returns {ProviderPin.constructor}
   * @see {@link MapProviderOptions#withPinClass}
   */
  getPinClass() {
    return this._pinClass;
  }

  /**
   * @returns {string}
   * @see {@link MapProviderOptions#withProviderName}
   */
  getProviderName() {
    return this._providerName;
  }

  /**
   * Call {@link MapPinOptions~loadFunction} and resolve or reject when loading succeeds or fails
   * @async
   * @param {string} [apiKey] Provider API key -- uses value from {@link MapProvider#setLoadOptions} if not passed
   * @param {Object} [options] Additional provider-specific options -- uses value from {@link MapProvider#setLoadOptions} if not passed
   */
  async load(apiKey = this._apiKey, options = this._options) {
    if (!this._loadInvoked) {
      this._loadInvoked = true;
      this._loadFunction(this._resolveLoad, this._rejectLoad, apiKey, options);
    }

    await this.ready();
    this._loaded = true;
  }

  /**
   * Resolves or rejects when the map provider has loaded successfully or unsuccessfully
   * @async
   */
  async ready() {
    await this._loadPromise;
  }

  /**
   * Set the API key and provider options to be used on load. Does nothing if load was already called.
   * @param {string} apiKey Provider API key
   * @param {?Object} [options=null] Additional provider-specific options
   */
  setLoadOptions(apiKey, options = null) {
    if (!this._loadInvoked) {
      this._apiKey = apiKey;
      this._options = options || this._options;
    }
  }
}

export {
  MapProviderOptions,
  MapProvider
}
