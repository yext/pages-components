import { DelayNavigation as NavigateAfterActionIfNeeded } from '@yext/components-yext-analytics';

export class TealiumAnalytics {
  // Takes Window as reference for better minification references
  constructor(win) {
    this.analyticsQName = 'tealium';
    const _this = this;
    this.loaded = false;
    this.configData = {};

    // Drain the command queue, if present
    if (window[this.analyticsQName]) {
      const cq = window[this.analyticsQName].q || [];
      while (cq.length) {
        let cmd = cq.shift();
        const commandArgs = [].slice.apply(cmd);
        this.processCommand(...commandArgs);
      }
    }

    // Replace the command queue with a proxy to this instance
    window[this.analyticsQName] = function() {
      _this.processCommand.apply(_this, [].slice.apply(arguments));
    };
  }

  loaded() {
    return this.loaded;
  }

  create(pageViewFireEvent, pageViewSetTag) {
    this.set({ pageViewFireEvent: pageViewFireEvent, pageViewSetTag: pageViewSetTag });
    return true;
  }

  set(data) {
    this.configData = this.configData || {};
    Object.assign(this.configData, data);
  }

  pageview(data) {
    // Set flags such that only one of the following conditions apply.

    /*
      Tealium-loaded scripts generally call utag.view() for us.
      Custom Tealium scripts may remove this option explicitly (client configuration).
      In that scenario, set pageViewFireEvent to true.
      pageViewFireEvent defaults to false.
    */
    if (this.configData.pageViewFireEvent) {
      utag.view(data);
    }

    /*
      UDO declared on page load (utag_data) is not explicitly reset with the utag.view() call.
      Set new UDO.
      pageViewSetTag defaults to true.
    */
    if (this.configData.pageViewSetTag) {
      window.utag_data = data;
    }
  }

  start() {
    this.setupBodyListener();
    this.loaded = true;
  }

  setupBodyListener() {
    // Add document listener to track click events
    document.body.addEventListener('click', (e) => {
      this.handleEvent(e);
    });
  }

  once(task) {
    if (!task)
      return function(){};

    let invoked = false;
    return function(){
      if (invoked)
        return;
      invoked = true;
      task();
    }
  }

  processCommand() {
    if (arguments.length === 0) {
      throw 'Received Analytics Command with no Arguments';
    }
    const command = arguments[0];
    const remainingArgs = [].slice.apply(arguments).slice(1);

    if (typeof this[command] === 'function') {
      return this[command](...remainingArgs);
    } else {
      throw `Unknown command ${command}`;
    }
  }

  fire(tealiumEvent, cb) {
    if (!this.loaded) {
      throw new Error(
        `Attempted to observe fire ${tealiumEvent} before Yext.TealiumAnalytics is fully loaded`,
      );
    }

    cb = this.once(cb);
    utag.link(tealiumEvent, cb);
    setTimeout(cb, 1000);
  }

  fireWithEvent(tealiumEvent, event) {
    NavigateAfterActionIfNeeded(
      (done) => {
        this.fire(tealiumEvent, done);
      },
      event,
    );
  }

  searchTargetForSelector(e, s) {
    let el = e.target;

    /* Loop up the DOM tree through parent elements to try to find an element that matches the given selector */
    while (el && (el.tagName && !el.matches(s))) {
      el = el.parentNode;
    }

    if (el && el.tagName && el.matches(s)) {
      return el;
    }

    return null;
  }

  getTealiumEventFromElement(e) {
    let tealiumEvent = null;
    let potentialTealiumTrackedEl = this.searchTargetForSelector(e, '[data-tealium-track]');

    if (potentialTealiumTrackedEl) {
      try {
        tealiumEvent = JSON.parse(potentialTealiumTrackedEl.dataset.tealiumTrack);
      } catch(error) {
        console.error("Tealium Event Parse Error for Element " + potentialTealiumTrackedEl + ": " + error);
      }
    }

    return tealiumEvent;
  }

  handleEvent(event) {
    let tealiumEvent = this.getTealiumEventFromElement(event);
    if (!tealiumEvent) return; // could not track
    this.fireWithEvent(tealiumEvent, event);
  }
}
