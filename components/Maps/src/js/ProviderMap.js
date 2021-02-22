import { Type, assertType, assertInstance } from '@yext/components-util';
import { MapProvider } from './MapProvider.js';

/**
 * {@link ProviderMap} options class
 */
class ProviderMapOptions {
  /**
   * @param {MapProvider} provider
   * @param {HTMLElement} wrapper The wrapper element that the map will be inserted into
   */
  constructor(provider, wrapper) {
    assertInstance(provider, MapProvider);
    assertInstance(wrapper, HTMLElement);

    this.providerMapClass = provider.getMapClass();
    this.wrapper = wrapper;

    this.controlEnabled = true;
    this.panHandler = () => {};
    this.panStartHandler = () => {};
    this.providerOptions = {};
  }

  /**
   * @param {boolean} controlEnabled Whether the user can interact with the map
   * @returns {ProviderMapOptions}
   */
  withControlEnabled(controlEnabled) {
    this.controlEnabled = controlEnabled;
    return this;
  }

  /**
   * @typedef ProviderMap~panHandler
   * @function
   */

  /**
   * @param {ProviderMap~panHandler} panHandler Function called after the map bounds change
   * @returns {ProviderMapOptions}
   */
  withPanHandler(panHandler) {
    assertType(panHandler, Type.FUNCTION);

    this.panHandler = panHandler;
    return this;
  }

  /**
   * @typedef ProviderMap~panStartHandler
   * @function
   */

  /**
   * @param {ProviderMap~panStartHandler} panStartHandler Function called before the map bounds change
   * @returns {ProviderMapOptions}
   */
  withPanStartHandler(panStartHandler) {
    assertType(panStartHandler, Type.FUNCTION);

    this.panStartHandler = panStartHandler;
    return this;
  }

  /**
   * @param {Object} providerOptions A free-form object used to set any additional provider-specific options, usually by passing the object to the map's constructor
   * @returns {ProviderMapOptions}
   */
  withProviderOptions(providerOptions) {
    this.providerOptions = providerOptions;
    return this;
  }

  /**
   * @returns {ProviderMap} An instance of a subclass of {@link ProviderMap} for the given {@link MapProvider}
   */
  build() {
    const providerMapClass = this.providerMapClass;
    return new providerMapClass(this);
  }
}

/**
 * This class is an interface that should be implemented for each map provider, such as Google Maps.
 * It is used as an API for a {@link Map} to control a provider-specific map instance.
 * Ideally, this class should have minimal functionality so that adding a new provider is easy and
 * behavior is as consistent as possible across all providers.
 * @interface
 */
class ProviderMap {
  /**
   * The constructor creates a map instance using the provider's API and initializes it with all the
   * given options. See {@link ProviderMapOptions} for the supported options.
   * @param {ProviderMapOptions} options
   */
  constructor(options) {
    assertInstance(options, ProviderMapOptions);

    // When implementing a new MapProvider, call _panStartHandler when the map viewport starts
    // changing, and call _panHandler when it stops.
    this._panHandler = options.panHandler;
    this._panStartHandler = options.panStartHandler;
  }

  /**
   * @returns {Coordinate} The current center of the map
   */
  getCenter() {
    throw new Error('not implemented');
  }

  /**
   * Zoom level complies with the specifications in {@link Map#getZoom}
   * @returns {number} The current zoom level of the map
   */
  getZoom() {
    throw new Error('not implemented');
  }

  /**
   * @param {Coordinate} coordinate The new center for the map
   * @param {boolean} animated Whether to transition smoothly to the new center
   */
  setCenter(coordinate, animated) {
    throw new Error('not implemented');
  }

  /**
   * Zoom level complies with the specifications in {@link Map#getZoom}
   * @param {number} zoom The new zoom level for the map
   * @param {boolean} animated Whether to transition smoothly to the new zoom
   */
  setZoom(zoom, animated) {
    throw new Error('not implemented');
  }

  /**
   * @param {number} zoom
   * @param {Object} center Must be convertible to {@link Coordinate}
   * @param {boolean} animated Whether to transition smoothly to the new bounds
   * @see {@link ProviderMap#setZoom}
   * @see {@link ProviderMap#setCenter}
   */
  setZoomCenter(zoom, center, animated) {
    // This method doesn't need to be implemented for each provider,
    // but it can be overridden if this default function doesn't work.
    this.setZoom(zoom, animated);
    this.setCenter(center, animated);
  }
}

export {
  ProviderMapOptions,
  ProviderMap
};
