import { strings__mapPinAltText } from 'templates/common/strings.soy';

/**
 * This class is used to set the appearance of a {@link MapPin}. Most properties are supported by
 * all pins, but some are only supported by HTML pins.
 */
class PinProperties {
  constructor() {
    // Properties supported by all pins
    this._anchorX = 0.5;
    this._anchorY = 1;
    this._height = 39;
    this._icon = 'default';
    this._srText = strings__mapPinAltText();
    this._width = 33;
    this._zIndex = 0;

    // Properties supported only by HTML pins
    this._class = '';
    this._element = null;
  }

  /**
   * @returns {number} The point in the pin that should be positioned over the coordinate, from 0 (left edge) to 1 (right edge)
   */
  getAnchorX() {
    return this._anchorX;
  }

  /**
   * @returns {number} The point in the pin that should be positioned over the coordinate, from 0 (top edge) to 1 (bottom edge)
   */
  getAnchorY() {
    return this._anchorY;
  }

  /**
   * HTML pins only
   * @returns {string} The class of the wrapper element for an HTML pin
   */
  getClass() {
    return this._class;
  }

  /**
   * HTML pins only
   * @returns {string} The HTML pin element
   */
  getElement() {
    return this._element;
  }

  /**
   * @returns {number} The pixel height of the pin
   */
  getHeight() {
    return this._height;
  }

  /**
   * This returns a string key that can be used with {@link MapPin#getIcon} to get the icon image for a pin.
   * @returns {string} The unique name of the icon
   */
  getIcon() {
    return this._icon;
  }

  /**
   * @returns {string} The text that a screen reader reads when focused on the pin
   */
  getSRText() {
    return this._srText;
  }

  /**
   * @returns {number} The pixel width of the pin
   */
  getWidth() {
    return this._width;
  }

  /**
   * @returns {number} The z-index of the pin
   */
  getZIndex() {
    return this._zIndex;
  }

  /**
   * @param {number} anchorX
   * @returns {PinProperties}
   * @see {PinProperties#getAnchorX}
   */
  setAnchorX(anchorX) {
    this._anchorX = anchorX;
    return this;
  }

  /**
   * @param {number} anchorY
   * @returns {PinProperties}
   * @see {PinProperties#getAnchorY}
   */
  setAnchorY(anchorY) {
    this._anchorY = anchorY;
    return this;
  }

  /**
   * @param {string} className
   * @returns {PinProperties}
   * @see {PinProperties#getClass}
   */
  setClass(className) {
    this._class = className;
    return this;
  }

  /**
   * @param {HTMLElement} element
   * @returns {PinProperties}
   * @see {PinProperties#getElement}
   */
  setElement(element) {
    this._element = element;
    return this;
  }

  /**
   * @param {number} height
   * @returns {PinProperties}
   * @see {PinProperties#getHeight}
   */
  setHeight(height) {
    this._height = height;
    return this;
  }

  /**
   * @param {string} icon
   * @returns {PinProperties}
   * @see {PinProperties#getIcon}
   */
  setIcon(icon) {
    this._icon = icon;
    return this;
  }

  /**
   * @param {string} srText
   * @returns {PinProperties}
   * @see {PinProperties#getSRText}
   */
  setSRText(srText) {
    this._srText = srText;
    return this;
  }

  /**
   * @param {number} width
   * @returns {PinProperties}
   * @see {PinProperties#getWidth}
   */
  setWidth(width) {
    this._width = width;
    return this;
  }

  /**
   * @param {number} zIndex
   * @returns {PinProperties}
   * @see {PinProperties#getZIndex}
   */
  setZIndex(zIndex) {
    this._zIndex = zIndex;
    return this;
  }
}

export {
  PinProperties
};
