import { DelayNavigation as NavigateAfterActionIfNeeded } from './DelayNavigation.js';
import { CalcEventNameForElement, SelectorTracking, SearchElementForSelector } from './Helpers.js';
import { PrintEvent } from './Utils.js';
import { onReady } from '@yext/components-util';
import slugify from 'slugify';

const conversionDomain = 'realtimeanalytics.yext.com';
const eventDomain = 'www.yext-pixel.com';
const conversionEndpoint = 'conversiontracking/conversion';
const listingsEndpoint = 'listings';
const eventEndpoint = 'store_pagespixel';

class Analytics {
  // Takes Window as reference for better minification references
  constructor(win = window, eventNameCalculator = CalcEventNameForElement) {
    const analyticsQName = win.YextAnalyticsObject || 'ya';

    this._eventNameCalculator = eventNameCalculator;
    this.win = win;
    this.dom = win.document;
    this.set({ pageurl: win.location.pathname, pagesReferrer: win.document.referrer });
    this.registeredListeners = {};
    this.StandardEvents = {
      WebsiteClick: 'website',
      DrivingDirections: 'directions',
      MobileCall: 'phone',
      CTAClick: 'cta'
    };
    this.delayNavigation = true;
    this.conversionTrackingEnabled = false;
    this.CONSTANTS = {
      COOKIE_PARAM: '_yfpc',
      COOKIE_REMOVAL_VALUE: '__temp__' // Only for expired cookies to be removed
    };
    this.listingsClickFired = false;

    const queryParams = this._getQueryParams();
    this.y_source = queryParams.y_source;

    if ('y_source' in queryParams) {
      // Remove the conversion source param to prevent re-submission on page reload
      delete queryParams.y_source;

      const queryString = this._buildQueryString(queryParams);
      window.history.replaceState(
        window.history.state,
        document.title,
        window.location.pathname + (queryString ? '?' + queryString : '')
      );
    }

    onReady(() => {
      // Always observe clicks so we can fire the catch-all interaction events
      this.registerObserver('click');

      // Drain the command queue, if present
      if (win[analyticsQName]) {
        const cq = win[analyticsQName].q || [];
        while (cq.length) {
          const commandArgs = cq.shift();
          this.processCommand(...commandArgs);
        }
      }

      // Replace the command queue with a proxy to this instance
      win[analyticsQName] = (...args) => this.processCommand(...args);
    });
  }

  setCalcEventName(calculator) {
    this._eventNameCalculator = calculator;
  }

  CalcEventNameForElement(target) {
    return this._eventNameCalculator(target);
  }

  loaded() {
    return this.siteData.siteId !== undefined &&
      this.siteData.businessids !== undefined;
  }

  create(busId, site, staging) {
    this.set({ businessids: busId, siteId: site, isStaging: staging });
    return true;
  }

  set(data) {
    this.siteData = Object.assign(this.siteData || {}, data);
  }

  setDelayNavigation(bool) {
    this.delayNavigation = bool;
  }

  setConversionTrackingEnabled(bool) {
    this.conversionTrackingEnabled = bool && !this.doNotTrackEnabled();
    this._fireListingsTagIfShould();
  }

  pageview() {
    this.send({ eventType: 'pageview' });
  }

  click(opts) {
    this.registerObserverForSelector('click', opts.selector, opts.name);
  }

  trackEvent(eventName, cb) {
    this.send({ eventType: eventName }, cb);
  }

  // Internal from here on out!
  /**
   * @return {number} The random number to include as a URL param
   */
  generateRandomCookie_() {
    return Math.floor(Math.random() * new Date().getTime());
  }

  /**
   * Retrieves the identifier stored as a cookie on the user's browser, if present. Otherwise
   * returns empty. This is accomplished by attempting to set a cookie at domains in order of
   * increasing specificity (e.g. ".com", then ".example.com", then ".subdomain.example.com"), and
   * the first one that we can set a cookie in is the root domain. Check if we already have a cookie
   * in the root domain and if not, check if a cookie exists without a domain, for legacy reasons.
   *
   * @private
   * @return {string} The value to include as a URL param, or empty
   */
  fetchCookie_() {
    let cookieValue = '';
    let checkDomain = (domain) => {
      if(this.canSetCookieWithDomain_(domain)) {
        let removedValue = this.removeCookieByDomain_(domain);
        if(removedValue) {
          // We found and removed a value, so put it back
          cookieValue = removedValue;
          this.setCookie_(cookieValue, domain);
        }
        // Exit the loop once we've reached root domain (the first domain where we can set a cookie)
        return true; 
      }
    };

    this.forEachDomainIncreasingSpecificity_(checkDomain);
    // If no cookie was present in the root domain, check for a cookie that doesn't have a domain
    // specified (by passing an empty string to checkDomain, indicating no domain).
    if(!cookieValue) checkDomain('');
    return cookieValue;
  }

  /**
   * Stores a cookie on the user's browser with the given value and domain, with name COOKIE_PARAM.
   *
   * @private
   * @param {string} cookieValue The value to set as the first party cookie
   * @param {string} cookieDomain The domain in which to set the cookie
   */
  setCookie_(cookieValue, cookieDomain) {
    let cookieString = this.formatCookie_(
      this.CONSTANTS.COOKIE_PARAM,
      cookieValue,
      cookieDomain);
    this.win.document.cookie = cookieString;
  }

  /**
   * Creates a formatted cookie string given a key, value, domain, and, optionally, a path. 
   * `Expires` is set to ensure the cookie is persistent, `Samesite=None` so the value can be 
   * included in cross-site requests,`Domain` defaults to root domain (if possible) to enable 
   * tracking across subdomains, and `Secure` is required when using 
   * `Samesite=None`: https://www.chromestatus.com/feature/5633521622188032
   * 
   * @private
   * @param {string} cookieName The name of the cookie
   * @param {string} cookieValue The value of the cookie
   * @param {string} domain The domain to set the cookie for
   * @param {string=} path The path to set the cookie for
   * @return {string} A cookie string which can be directly added to a document's cookies
   */
  formatCookie_(cookieName, cookieValue, domain, path = '/') {
    let cookieString = cookieName + '=' + cookieValue,
        now = new Date();
    now.setTime(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    cookieString += ';path=' + path;
    cookieString += ';expires=' + now.toUTCString();
    if(domain) cookieString += ';domain=' + domain;
    cookieString += ';samesite=None;';
    if (this.win.location.protocol === 'https:') {
      cookieString += ' Secure ';
    }
    return cookieString;
  }

  /**
   * Returns whether we are able to set a cookie (formatted like the actual cookie for tracking)
   * at a specified domain or not. Preserves existing cookies in the same domain (but not their
   * expiration dates).
   * 
   * @private
   * @param {string} domain The value for the cookie's domain attribute
   * @return {boolean} Whether a dummy cookie was successfully set with domain set to domain.
   */
  canSetCookieWithDomain_(domain) {
    let lostCookie = this.removeCookieByDomain_(domain);

    let existingCookies = this.allCookies_();
    this.setCookie_(this.CONSTANTS.COOKIE_REMOVAL_VALUE, domain);
    let newCookies = this.allCookies_();
    if(existingCookies.length < newCookies.length) {
      // Cookie was successfully saved, so wipe it and put back the old cookie if there was one
      if(lostCookie) {
        this.setCookie_(lostCookie, domain);
      }else {
        this.clearCookie_(domain);
      }
      return true;
    }
    return false;
  }

  /**
   * Sets a cookie with name COOKIE_PARAM to make it expire immediately.
   * 
   * @private
   * @param {string=} cookieDomain The domain of the cookie to clear
   * @param {string=} cookiePath The path of the cookie to be deleted (defaults to '/')
   */
  clearCookie_(cookieDomain = '', cookiePath = '/') {
    let cookieName = this.CONSTANTS.COOKIE_PARAM;
    let epoch = new Date(0);
    let cookieString = cookieName + '=' + this.CONSTANTS.COOKIE_REMOVAL_VALUE;
    cookieString += ';path=' + cookiePath;
    cookieString += ';expires=' + epoch.toUTCString();
    if(cookieDomain) cookieString += ';domain=' + cookieDomain + ';';
    cookieString += ';samesite=None;';
    if (this.win.location.protocol === 'https:') {
      cookieString += ' Secure ';
    }
    this.dom.cookie = cookieString;
  }

  /**
   * Removes a COOKIE_PARAM cookie by domain, then returns its value if successful and empty string
   * otherwise.
   * 
   * @private
   * @param {string} cookieDomain The domain to remove the cookie from
   * @return {string} The value of the cookie, or empty string if not found.
   */
  removeCookieByDomain_(cookieDomain) {
    let prevRemainingCookies = this.persistentCookies_();
    this.clearCookie_(cookieDomain);
    let remainingCookies = this.persistentCookies_();
    
    if(remainingCookies.length < prevRemainingCookies.length) {
      let removedValue = this.listDifference_(prevRemainingCookies, remainingCookies)[0] || '';
      return removedValue;
    }
    return '';
  }

  /**
   * Returns the list difference between a superlist and sublist, accounting for number of
   * occurrences.
   * 
   * @private
   * @param {!Array<?>} superlist The full array
   * @param {!Array<?>} sublist The subarray
   * @return {!Array<?>} The elements in superset that are not in subset
   */
  listDifference_(superlist, sublist) {
    let superlistCopy = Array.from(superlist);
    for(let i = 0; i < sublist.length; i++) {
      let index = superlistCopy.indexOf(sublist[i]);
      if(index !== -1) {
        superlistCopy.splice(index, 1);
      }
    }
    return superlistCopy;
  }

  /**
   * Retrieves a list of values of cookies with the name of COOKIE_PARAM that are present and not 
   * set to be removed (i.e. having the specific value this script uses to indicate a removed
   * cookie).
   * 
   * @private
   * @return {!Array<string>} The non-temporary values associated to COOKIE_PARAM
   */
  persistentCookies_() {
    return this.allCookies_().filter(
      val => val !== this.CONSTANTS.COOKIE_REMOVAL_VALUE);
  }

  /**
   * Retrieves a list of values of cookies with the name of COOKIE_PARAM that are present.
   * 
   * @private
   * @return {!Array<string>} All values associated to COOKIE_PARAM
   */
  allCookies_() {
    let cookieName = this.CONSTANTS.COOKIE_PARAM;
    let arr = [];
    this.forEachCookieNameValue_((name, value) => {
      if(name === cookieName) {
        arr.push(value);
      }
    });
    return arr;
  }

  /**
   * Runs nameValueFunc on each cookie's key and value (after trimming), only if the key and value 
   * are both truthy.
   * 
   * @private
   * @param {function(string, string)} nameValueFunc A function to run on each cookie key-value pair
   */
  forEachCookieNameValue_(nameValueFunc) {
    this.win.document.cookie.split(';').forEach((cookie) => {
      let keyValue = cookie.split('='),
          key = keyValue[0],
          value = keyValue[1];

      if(key && value) {
        nameValueFunc(key.trim(), value.trim());
      }
    })
  }

  /**
   * Runs a function on each possible domain in order of increasing specificity (e.g. .com,
   * .example.com, .full.example.com). Note that empty string, indicating unset domain, is iterated
   * through at the end. A truthy return value indicates to break out of the loop.
   * 
   * @private
   * @param {function(string): (boolean|undefined)} func A function to call on each possible domain 
   */
  forEachDomainIncreasingSpecificity_(func) {
    let exitedLoop = false;
    let domainParts = this.win.location.hostname.split('.').reverse();
    let currDomain = '';

    for(let i = 0; i < domainParts.length; i++) {
      currDomain = '.' + domainParts[i] + currDomain;
      if(func(currDomain)) {
        exitedLoop = true;
        break;
      }
    }
    if(!exitedLoop) func('');
  }

  /**
   * Stores a tracking cookie on the user's browser with the given value in the root domain, and
   * removes first party cookies from all other domains (which may be present for legacy reasons).
   *
   * @private
   * @param {string} cookieValue The value to set as the first party cookie
   */
  setCookieAndRemoveOldCookies_(cookieValue) {
    let rootDomainReached = false;
    let totalCookies = this.allCookies_().length;
    let numCookiesEncountered = 0;
    
    // Iterate until we find the topmost domain (the root domain), where we set the cookie, 
    // then continue iterating, just deleting any cookies we find afterwards.
    this.forEachDomainIncreasingSpecificity_(domain => {
      if(rootDomainReached) {
        if(this.removeCookieByDomain_(domain)) numCookiesEncountered++;
      }else {
        if(this.canSetCookieWithDomain_(domain)) {
          // In root domain, so set cookie
          if(this.removeCookieByDomain_(domain)) numCookiesEncountered++;
          this.setCookie_(cookieValue, domain);
          rootDomainReached = true;
        }
      }

      if(numCookiesEncountered >= totalCookies && rootDomainReached) {
        // Break if we've already encountered every cookie and we already set one in root domain
        return true;
      }
    });
  }

  /**
    * Fire a listings conversion click event once. This event must not be fired before the user
    * opts in to conversion tracking.
    */
  _fireListingsTagIfShould() {
    if (this.listingsClickFired || !this.conversionTrackingEnabled || !this.y_source) {
      return;
    }

    let cookieValue = this.fetchCookie_();
    if (!cookieValue) {
      cookieValue = this.generateRandomCookie_().toString();
    }
    this.setCookieAndRemoveOldCookies_(cookieValue);


    const data = {
      y_source: this.y_source,
      referrer: document.referrer,
      location: window.location.href,
      [this.CONSTANTS.COOKIE_PARAM]: cookieValue
    };

    const url = this._getTrackerUrl(conversionDomain, listingsEndpoint, data);

    this.fire(url);
    this.listingsClickFired = true;
  }

  /**
   * Build a query string from the given data
   *
   * @param {Object} data The data to be serialized in the query
   * @return {string} The data as a query string, 'key=value' joined by '&'
   */
  _buildQueryString(data) {
    return Object.entries(data)
      .filter(([key]) => key)
      .map(([key, value]) => {
        return (Array.isArray(value) ? value : [value])
          .map(val => key + '=' + encodeURIComponent(val === undefined ? '' : val))
          .join('&')
      })
      .join('&');
  }

  /**
   * Get the URL for an analytics event
   *
   * @param {string} domain The domain of the URL
   * @param {string} endpoint The path after the domain
   * @param {Object} data The data to be serialized in the query
   * @return {string} The full URL
   */
  _getTrackerUrl(domain, endpoint, data) {
    const queryString = this._buildQueryString(data);
    return `https://${domain}/${endpoint}?${queryString}`;
  }

  /**
   * Get the URL query parameters from window.location.search
   *
   * @return {Object} The URL parameters
   */
  _getQueryParams() {
    return window.location.search.substring(1)
      .split('&')
      .map(param => param.split('='))
      .reduce((params, [key, value]) => {
        const decodedVal = value && decodeURIComponent(value);
        if (key in params) {
          if (Array.isArray(params[key])) {
            params[key].push(decodedVal);
          } else {
            params[key] = [params[key], decodedVal];
          }
        } else {
          params[key] = decodedVal;
        }
        return params;
      }, {});
  }

  once(task) {
    if (!task)
      return;

    let invoked = false;
    return () => {
      if (invoked)
        return;
      invoked = true;
      task();
    };
  }

  send(data, cb) {
    this.fire(this.pixelURL(data), cb);
  }

  registerObserverForSelector(eventType, selector, eventName) {
    this.registerObserver(eventType);
    // GENERATOR TODO: Do we want to be able to track multiple events for the same selector?
    SelectorTracking[selector] = eventName;
  }

  registerObserver(eventType) {
    if (!this.registeredListeners.hasOwnProperty(eventType)) {
      // this used to call a polyfill at the top of the page that was migrated to
      // the Polyfills Components (test in IE)
      this.dom.body.addEventListener(eventType, this.handleEvent.bind(this));
      this.registeredListeners[eventType] = true;
    }
  }

  unRegisterObserver(eventType, selector, eventName) {
    if (SelectorTracking.hasOwnProperty(selector)) {
      delete SelectorTracking[selector];
    }
    // GENERATOR TODO: coordinate remove of selector tracking with unregistering event listener
  }

  processCommand(command, ...args) {
    if (arguments.length === 0) {
      throw 'Received Analytics Command with no Arguments';
    }

    if (typeof this[command] === 'function') {
      return this[command](...args);
    } else {
      throw `Unknown command ${command}`;
    }
  }

  pixelURL(optionalData) {
    const combinedData = Object.assign(
      {
        product: 'storepages',
        v: this.seed()
      },
      this.siteData,
      optionalData
    );

    if (this.conversionTrackingEnabled) {
      let cookieValue = this.fetchCookie_();
      if (!cookieValue) {
        cookieValue = this.generateRandomCookie_().toString();
      }
      this.setCookieAndRemoveOldCookies_(cookieValue);
      combinedData[this.CONSTANTS.COOKIE_PARAM] = cookieValue;
    }

    if (optionalData.eventType) {
      PrintEvent(optionalData.eventType);
    }

    const analyticsDomain = this.conversionTrackingEnabled ? conversionDomain : eventDomain;

    return this._getTrackerUrl(analyticsDomain, eventEndpoint, combinedData);
  }

  getConversionParams(el) {
    for (let current = el; current !== null; current = current.parentNode) {
      if (!current.dataset) {
        continue;
      }

      if (current.dataset.yaCid) {
        const params = {
          cid: current.dataset.yaCid
        };

        return params;
      }
    }
  }

  // ported from https://assets.sitescdn.net/ytag/ytag.min.js
  conversionURL(data) {
    return this._getTrackerUrl(conversionDomain, conversionEndpoint, data);
  }

  seed() {
    return Date.now() + Math.floor(1000 * Math.random());
  }

  fire(pixel, cb) {
    if (!this.loaded()) {
      throw new Error(
        `Attempted to observe fire ${pixel} on ${event.type} before initializing Yext.Analytics.SiteData`,
      );
    }

    const px = this.dom.createElement('img');
    px.src = pixel;
    px.style.width = '0';
    px.style.height = '0';
    px.style.position = 'absolute';
    px.alt = '';

    if (cb) {
      // The callback passed to this function should be invoked after the pixel has successfully
      // fired and we're confident the tracking server has received the request.  The most common
      // use of the callback is to navigate the user agent away from the current domain - say, a click
      // on an anchor tag with an off-domain href.  In those situations, we want to 'delay' the
      // actual browser navigation because the act of moving to another domain will cause some
      // user agents to cancel all in-flight network requests that the current page originated,
      // including an image load like the one we use here for analytics transport.
      //
      // That said, it's critical that the callback is _eventually_ invoked since it represents
      // preservation of the user's intent (to navigate away).  `onload` and `onerror` provide
      // most of the coverage we need - the majority of the time the pixel should load in < 100ms,
      // and in the unlikely scenario the pixel server was unavailable the error should happen
      // quickly.  However, there are situations in which the user-agent could connect to the
      // pixel server but listen indefinitely for a response - high load or stuck threads, for
      // example.  The setTimeout(), thereforce, acts as an absolute failsafe.
      //
      // The once wrapper ensures that the cb function is only invoked a single time.
      const onceCB = this.once(cb);
      px.onload = onceCB;
      px.onerror = onceCB;
      setTimeout(onceCB, 1000);
    }

    this.dom.body.appendChild(px);
  }

  fireWithEvent(pixel, event) {
    if (this.delayNavigation) {
      NavigateAfterActionIfNeeded(
        done => this.fire(pixel, done),
        event
      );
    } else {
      this.fire(pixel);
    }
  }

  analyticsSlug(text) {
    return slugify(text, '_').toLowerCase();
  }

  handleConversion(event) {
    return new Promise((resolve, reject) => {
      const params = this.getConversionParams(event.target);
      if (!params) { return resolve(); }

      Object.assign(params, {
        v: Date.now() + Math.floor(1E3 * Math.random())
      });

      const url = this.conversionURL(params);

      this.fire(url, resolve);
    });
  }

  async handleEvent(event) {
    for (const selector in SelectorTracking) {
      if (SelectorTracking.hasOwnProperty(selector)) {
        if (SearchElementForSelector(event.target, selector)) {
          this.fireWithEvent(this.pixelURL({ eventType: SelectorTracking[selector] }), event);
          return; // prevent double counting
        }
      }
    }

    const eventName = this.CalcEventNameForElement(event.target);
    if (!eventName) return; // could not track

    if (this.conversionTrackingEnabled) {
      await this.handleConversion(event);
    }

    this.fireWithEvent(this.pixelURL({ eventType: eventName }), event);
  }

  doNotTrackEnabled() {
    return this.win.doNotTrack == '1'
      || this.win.navigator.doNotTrack == 'yes'
      || this.win.navigator.doNotTrack == '1'
      || this.win.navigator.msDoNotTrack == '1';
  }
}

export {
  Analytics
};
