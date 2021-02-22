import { HTMLProviderPin, MapPinOptions, MapProvider, PinProperties } from '@yext/components-maps';
import { assertInstance } from '@yext/components-util';
import { components__InfoWindow__InfoWindow } from '../templates/InfoWindow.soy';

/**
 * {@link InfoWindow} options class
 */
class InfoWindowOptions {
  /**
   * Initialize with default options
   */
  constructor() {
    this.mapProvider = null;
    this.offset = 50;
    this.zIndex = 3;
  }

  /**
   * The MapProvider must be loaded before constructing a Map with it.
   * @param {NapProvider} mapProvider
   * @returns {InfoWindowOptions}
   */
  withMapProvider(mapProvider) {
    assertInstance(mapProvider, MapProvider);

    this.mapProvider = mapProvider;
    return this;
  }

  /**
   * @param {number} offset The pixel distance from the bottom tip of the InfoWindow to the pin's coordinate
   * @returns {InfoWindowOptions}
   */
  withOffset(offset) {
    this.offset = offset;
    return this;
  }

  /**
   * @param {number} zIndex The z-index of the InfoWindow
   */
  withZIndex(zIndex) {
    this.zIndex = zIndex;
    return this;
  }

  /**
   * @returns {InfoWindow}
   */
  build() {
    return new InfoWindow(this);
  }
}

/**
 * An info window that pops up over a {@link MapPin} to display custom HTML content. An InfoWindow
 * can be displayed on at most one MapPin at a time. InfoWindow works with any map provider that
 * supports HTML pins.
 */
class InfoWindow {
  constructor(options) {
    assertInstance(options, InfoWindowOptions);

    this._element = document.createElement('div');
    this._element.classList.add('InfoWindow');
    this._element.innerHTML = components__InfoWindow__InfoWindow(Yext);
    this._contentWrapper = this._element.querySelector('.js-infowindow-content');

    // Add and remove the tip element so we can determine its height
    const tipEl = this._element.querySelector('.js-infowindow-tip');
    document.body.appendChild(tipEl);
    this._tipHeight = tipEl.offsetHeight;
    this._element.appendChild(tipEl);

    this.setOffset(options.offset);
    this.setZIndex(options.zIndex);

    for (const closeButton of this._element.querySelectorAll('.js-infowindow-close')) {
      closeButton.addEventListener('click', () => this.close());
    }

    // Map provider must extend HTMLProviderPin for InfoWindow to work
    if (HTMLProviderPin.isPrototypeOf(options.mapProvider.getPinClass())) {
      this._pin = new MapPinOptions()
        .withProvider(options.mapProvider)
        .withPropertiesForStatus(status => new PinProperties()
          .setElement(this._element)
          .setZIndex(this._zIndex)
        )
        .build();
    } else {
      console.warn(`InfoWindow for ${options.mapProvider.getProviderName()} is not supported. Map pins must implement HTMLProviderPin.`);
    }
  }

  /**
   * Remove the InfoWindow from the map
   */
  close() {
    if (this._pin) {
      this._pin.remove();
    }
  }

  /**
   * Add the InfoWindow to the map, anchored to the coordinate of the given pin
   * @param {MapPin} pin The pin where the InfoWindow will be opened
   */
  open(pin) {
    if (this._pin) {
      this._pin.setCoordinate(pin.getCoordinate());
      this._pin.setMap(pin.getMap());
    }
  }

  /**
   * @param {HTMLElement|string} content Content of the InfoWindow: an element, string, or HTML string
   */
  setContent(content) {
    if (content instanceof HTMLElement) {
      while (this._contentWrapper.lastChild) {
        this._contentWrapper.removeChild(this._contentWrapper.lastChild);
      }

      this._contentWrapper.appendChild(content);
    } else {
      this._contentWrapper.innerHTML = content;
    }
  }

  /**
   * @param {number} offset The pixel distance from the bottom tip of the InfoWindow to the pin's coordinate
   */
  setOffset(offset) {
    this._element.style.transform = `translateY(-100%) translateY(${-offset - this._tipHeight}px)`;
  }

  /**
   * @param {number} zIndex The z-index of the InfoWindow
   */
  setZIndex(zIndex) {
    this._zIndex = zIndex;
  }
}

export {
  InfoWindowOptions,
  InfoWindow
};
