import { Type, assertType, assertInstance } from '@yext/components-util';
import { MapProvider } from './MapProvider.js';

/**
 * {@link ProviderPin} options class
 */
class ProviderPinOptions {
  /**
   * @param {MapProvider} provider
   */
  constructor(provider) {
    assertInstance(provider, MapProvider);

    this.providerPinClass = provider.getPinClass();

    this.clickHandler = () => {};
    this.focusHandler = focused => {};
    this.hoverHandler = hovered => {};
    this.icons = {};
  }

  /**
   * @typedef ProviderPin~clickHandler
   * @function
   */

  /**
   * @param {ProviderPin~clickHandler} clickHandler Function called when the pin is clicked
   * @returns {ProviderPinOptions}
   */
  withClickHandler(clickHandler) {
    assertType(clickHandler, Type.FUNCTION);

    this.clickHandler = clickHandler;
    return this;
  }

  /**
   * @typedef ProviderPin~focusHandler
   * @function
   * @param {boolean} focused Whether the pin is currently focused
   */

  /**
   * @param {ProviderPin~focusHandler} focusHandler Function called when the pin becomes (un)focused
   * @returns {ProviderPinOptions}
   */
  withFocusHandler(focusHandler) {
    assertType(focusHandler, Type.FUNCTION);

    this.focusHandler = focusHandler;
    return this;
  }

  /**
   * @typedef ProviderPin~hoverHandler
   * @function
   * @param {boolean} hovered Whether the pin is currently hovered
   */

  /**
   * @param {ProviderPin~hoverHandler} hoverHandler Function called when the pin becomes (un)hovered
   * @returns {ProviderPinOptions}
   */
  withHoverHandler(hoverHandler) {
    assertType(hoverHandler, Type.FUNCTION);

    this.hoverHandler = hoverHandler;
    return this;
  }

  /**
   * Similar to {@link MapPinOptions#withIcon}, but all icons are given as a map of key => icon.
   * If a provider pin instance needs an icon to be a specialized class rather than a simple URL,
   * the icons in this object can be converted in this function and assigned back to the icons object
   * instead of being recreated from the URL every time the pin's icon changes.
   * @param {Object<string,string>} icons Map of a string key to the URL or data URI of the icon image
   * @returns {ProviderPinOptions}
   */
  withIcons(icons) {
    this.icons = icons;
    return this;
  }

  /**
   * @returns {ProviderPin} An instance of a subclass of {@link ProviderPin} for the given {@link MapProvider}
   */
  build() {
    const providerPinClass = this.providerPinClass;
    return new providerPinClass(this);
  }
}

/**
 * This class is an interface that should be implemented for each map provider, such as Google Maps.
 * It is used as an API for a {@link MapPin} to control a provider-specific pin instance.
 * Ideally, this class should have minimal functionality so that adding a new provider is easy and
 * behavior is as consistent as possible across all providers.
 * @interface
 */
class ProviderPin {
  /**
   * The constructor creates a pin instance using the provider's API and initializes it with all the
   * given options. See {@link ProviderPinOptions} for the supported options.
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    assertInstance(options, ProviderPinOptions);

    this._clickHandler = options.clickHandler;
    this._focusHandler = options.focusHandler;
    this._hoverHandler = options.hoverHandler;
    this._icons = options.icons;
  }

  /**
   * @param {Coordinate} coordinate The position of the pin
   */
  setCoordinate(coordinate) {
    throw new Error('not implemented');
  }

  /**
   * Remove the pin from its current map and, if newMap is not null, add it to the new map.
   * @param {?Map} newMap The new map -- if null, the pin will not be shown on any map
   * @param {?Map} currentMap The current map -- if null, the pin is not shown on any map
   */
  setMap(newMap, currentMap) {
    throw new Error('not implemented');
  }

  /**
   * Apply the given properties to modify the appearance of the pin.
   * @param {PinProperties} pinProperties
   * @see {@link PinProperties}
   */
  setProperties(pinProperties) {
    throw new Error('not implemented');
  }
}

const htmlPinBaseStyle = Object.freeze({
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
  left: '0',
  outline: 'none',
  position: 'absolute',
  top: '0'
});

/**
 * This class is an extension of {@link ProviderPin} that allows HTML elements to be used as map pins.
 * @interface
 * @implements {ProviderPin}
 */
class HTMLProviderPin extends ProviderPin {
  /**
   * This is the base style applied to pin elements. It is a map from CSS property to value, such
   * as 'position': 'absolute'
   * @returns {Object} An object whose structure matches the style property of an HTML element
   */
  static get baseStyle() {
    return htmlPinBaseStyle;
  }

  /**
   * After instatiating a {@link ProviderPin}, this creates a wrapper element and a default pin element.
   * @param {ProviderPinOptions} options
   */
  constructor(options) {
    super(options);

    this._pinEl = document.createElement('button');
    Object.assign(this._pinEl.style, this.constructor.baseStyle);

    this._pinAlt = document.createElement('span');
    this._pinAlt.classList.add('sr-only');
    this._pinEl.appendChild(this._pinAlt);

    this._wrapper = document.createElement('div');
    this._wrapper.appendChild(this._pinEl);
    this._wrapper.style.position = 'absolute';

    this.addListeners();
  }

  /**
   * Adds click, hover, and focus event listeners to the wrapper element
   */
  addListeners() {
    this._wrapper.addEventListener('click', () => this._clickHandler());
    this._wrapper.addEventListener('focusin', () => this._focusHandler(true));
    this._wrapper.addEventListener('focusout', () => this._focusHandler(false));
    this._wrapper.addEventListener('mouseover', () => this._hoverHandler(true));
    this._wrapper.addEventListener('mouseout', () => this._hoverHandler(false));
  }

  /**
   * @param {PinProperties} pinProperties
   * @see {@link ProviderPin~setProperties}
   */
  setProperties(pinProperties) {
    this.setElementProperties(pinProperties);

    const className = pinProperties.getClass();
    const element = pinProperties.getElement() || this._pinEl;
    const zIndex = pinProperties.getZIndex();

    if (this._wrapper) {
      this._wrapper.style.zIndex = zIndex;
      this._wrapper.setAttribute('class', className);

      if (element != this._wrapper.children[0]) {
        this._wrapper.removeChild(this._wrapper.children[0]);
        this._wrapper.appendChild(element);
      }
    }
  }

  /**
   * Sets properties used specifically by the pin element
   * @param {PinProperties} pinProperties
   */
  setElementProperties(pinProperties) {
    const anchorX = pinProperties.getAnchorX();
    const anchorY = pinProperties.getAnchorY();
    const height = pinProperties.getHeight();
    const icon = this._icons[pinProperties.getIcon()];
    const srText = pinProperties.getSRText();
    const width = pinProperties.getWidth();

    Object.assign(this._pinEl.style, {
      backgroundImage: icon ? `url("${icon}")` : '',
      height: height + 'px',
      transform: `translate(${-100 * anchorX}%, ${-100 * anchorY}%)`,
      width: width + 'px'
    });

    this._pinAlt.innerText = srText;
  }
}

export {
  ProviderPinOptions,
  ProviderPin,
  HTMLProviderPin
};
