import { Coordinate } from '@yext/components-geo';
import { Type, assertType, assertInstance } from '@yext/components-util';
import { Map } from './Map.js';
import { MapProvider } from './MapProvider.js';
import { PinProperties } from './PinProperties.js';
import { ProviderPinOptions } from './ProviderPin.js';

/**
 * {@link MapPin} options class
 */
class MapPinOptions {
  /**
   * Initialize with default options
   */
  constructor() {
    this.coordinate = new Coordinate(0, 0);
    this.hideOffscreen = false;
    this.icons = {};
    this.propertiesForStatus = status => new PinProperties();
    this.provider = null;
    this.type = '';
  }

  /**
   * @param {Object} coordinate Must be convertible to {@link Coordinate}
   * @returns {MapPinOptions}
   */
  withCoordinate(coordinate) {
    this.coordinate = new Coordinate(coordinate);
    return this;
  }

  /**
   * @param {boolean} hideOffscreen If true, the pin will only be rendered if it's in the visible portion of the map to improve performance
   * @returns {MapPinOptions}
   */
  withHideOffscreen(hideOffscreen) {
    this.hideOffscreen = hideOffscreen;
    return this;
  }

  /**
   * @param {string} key The unique name for the icon, used in {@link PinProperties#getIcon} and {@link PinProperties#setIcon}
   * @param {string} icon The URL or data URI of the icon image
   * @returns {MapPinOptions}
   */
  withIcon(key, icon) {
    this.icons[key] = icon;
    return this;
  }

  /**
   * @typedef MapPin~propertiesForStatus
   * @function
   * @param {Object} status A generic object whose properties define the state of the pin, from {@link MapPin#setStatus}
   * @returns {PinProperties}
   * @see MapPin#setStatus
   */

  /**
   * @param {MapPin~propertiesForStatus} propertiesForStatus
   * @returns {MapPinOptions}
   */
  withPropertiesForStatus(propertiesForStatus) {
    assertType(propertiesForStatus, Type.FUNCTION);

    this.propertiesForStatus = propertiesForStatus;
    return this;
  }

  /**
   * @param provider {MapProvider}
   * @returns {MapPinOptions}
   */
  withProvider(provider) {
    assertInstance(provider, MapProvider);

    this.provider = provider;
    return this;
  }

  /**
   * @param {string} type A string describing the type of the pin
   * @returns {MapPinOptions}
   */
  withType(type) {
    this.type = type;
    return this;
  }

  /**
   * @returns {MapPin}
   */
  build() {
    return new MapPin(this);
  }
}

/**
 * A pin for a {@link Map} that displays at a given {@link Coordinate}. A MapPin can be displayed on
 * at most one Map at a time. Pins support event handlers for clicking, hovering, and focusing.
 * The pin can change its appearance based on its current status, which is changed by {@link MapPin#setStatus}.
 */
class MapPin {
  /**
   * @param {MapPinOptions} options
   */
  constructor(options) {
    assertInstance(options, MapPinOptions);
    assertInstance(options.provider, MapProvider);

    if (!options.provider.loaded) {
      throw new Error(`'${options.provider.constructor.name}' is not loaded. The MapProvider must be loaded before calling MapPin constructor.`);
    }

    this._coordinate = options.coordinate;
    this._hideOffscreen = options.hideOffscreen;
    this._icons = { ...options.icons };
    this._propertiesForStatus = options.propertiesForStatus;
    this._type = options.type;

    this._clickHandler = () => {};
    this._focusHandler = focused => this._hoverHandler(focused);
    this._hoverHandler = hovered => {};

    this._hidden = false;
    this._hiddenUpdater = null;

    this._map = null;

    this._pin = new ProviderPinOptions(options.provider)
      .withIcons({ ...this._icons })
      .withClickHandler(() => this._clickHandler())
      .withFocusHandler(focused => this._focusHandler(focused))
      .withHoverHandler(hovered => this._hoverHandler(hovered))
      .build();

    this._pin.setCoordinate(options.coordinate);

    this._status = {};
    this.setStatus(this._status);
  }

  /**
   * @returns {Coordinate} The coordinate of the pin
   */
  getCoordinate() {
    return this._coordinate;
  }

  /**
   * Get the icon for a string key, such as 'default', 'hovered', or 'selected'
   * @param {string} key The unique name of the icon
   * @returns {string} The URL or data URI of the icon image
   * @see MapPinOptions#withIcon
   */
  getIcon(key) {
    return this._icons[key];
  }

  /**
   * @returns {?Map} The map that the pin is currently on, or null if not on a map
   */
  getMap() {
    return this._map;
  }

  /**
   * Intended for internal use only
   * @returns {ProviderPin} The pin's ProviderPin instance
   */
  getProviderPin() {
    return this._pin;
  }

  /**
   * Remove this pin from its current map, if on one.
   */
  remove() {
    this.setMap(null);
  }

  /**
   * @typedef MapPin~clickHandler
   * @function
   */

  /**
   * Set a handler function for when the pin is clicked, replacing any previously set click handler.
   * @param {MapPin~clickHandler} clickHandler
   */
  setClickHandler(clickHandler) {
    assertType(clickHandler, Type.FUNCTION);

    this._clickHandler = clickHandler;
  }

  /**
   * @param {Object} coordinate Must be convertible to {@link Coordinate}
   */
  setCoordinate(coordinate) {
    this._coordinate = new Coordinate(coordinate);
    this._pin.setCoordinate(this._coordinate);

    if (this._hideOffscreen) {
      this._hideIfOffscreen();
    }
  }

  /**
   * @typedef MapPin~focusHandler
   * @function
   * @param {boolean} focused Whether the pin is currently focused
   */

  /**
   * Set a handler function for when the pin is (un)focused, replacing any previously set focus handler.
   * @param {MapPin~focusHandler} focusHandler
   */
  setFocusHandler(focusHandler) {
    assertType(focusHandler, Type.FUNCTION);

    this._focusHandler = focusHandler;
  }

  /**
   * @typedef MapPin~hoverHandler
   * @function
   * @param {boolean} hovered Whether the pin is currently hovered
   */

  /**
   * Set a handler function for when the pin is (un)hovered, replacing any previously set hover handler.
   * @param {MapPin~hoverHandler} hoverHandler
   */
  setHoverHandler(hoverHandler) {
    assertType(hoverHandler, Type.FUNCTION);

    this._hoverHandler = hoverHandler;
  }

  /**
   * Add the pin to a map, removing it from its current map if on one.
   * @param {?Map} map
   */
  setMap(map) {
    if (map !== null) {
      assertInstance(map, Map);
    }

    this._pin.setMap(map, this._hidden ? null : this._map);
    this._map = map;
    this._hidden = false;

    if (map && this._hideOffscreen) {
      const hiddenUpdater = async () => {
        // Wait for the map to move, then stop moving
        await map.moving();
        await map.idle();

        // Make sure that the updater didn't get reset while waiting
        if (this._hiddenUpdater == hiddenUpdater) {
          this._hideIfOffscreen();
          hiddenUpdater();
        }
      };

      this._hiddenUpdater = hiddenUpdater;
      hiddenUpdater();
    } else {
      this._hiddenUpdater = null;
    }
  }

  /**
   * Assign all properties in an object to the pin's status.
   * Example: if the pin's status is { a: true, b: true }, passing in { a: false, c: true } will
   * change the pin's status to { a: false, b: true, c: true }
   * @param {Object} status
   */
  setStatus(status) {
    Object.assign(this._status, status);
    this._pin.setProperties(this._propertiesForStatus(this._status));
  }

  _hideIfOffscreen() {
    const isVisible = this._map.getBounds().contains(this._coordinate);

    if (this._hidden && isVisible) {
      this._pin.setMap(this._map, null);
    } else if (!this._hidden && !isVisible) {
      this._pin.setMap(null, this._map);
    }

    this._hidden = !isVisible;
  }
}

export {
  MapPinOptions,
  MapPin,
  PinProperties
};
