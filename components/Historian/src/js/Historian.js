import { Type, assertType, assertInstance } from '@yext/components-util';
import { stateChanged } from './helpers.js';

class HistorianOptions {
  constructor() {
    this.stateHandler = data => {};
    this.titleForState = data => document.title;
    this.urlPathQueryForState = data => window.location.pathname + window.location.search;
  }

  /**
   * stateHandler: function(data)
   * Called when a browser history event occurs, specifically when the ‘popstate’
   * event occurs. It is given the data saved in the state, equivalent to
   * window.history.state. If the state is null, this function is not called.
   */
  withStateHandler(stateHandler) {
    assertType(stateHandler, Type.FUNCTION);

    this.stateHandler = stateHandler;
    return this;
  }

  /**
   * titleForState: function(data) => string
   * Gets the title of the page for a given state (search response data)
   */
  withTitleForState(titleForState) {
    assertType(titleForState, Type.FUNCTION);

    this.titleForState = titleForState;
    return this;
  }

  /**
   * urlPathQueryForState: function(data) => string
   * Gets the URL path and query for a given state (search response data)
   */
  withURLPathQueryForState(urlPathQueryForState) {
    assertType(urlPathQueryForState, Type.FUNCTION);

    this.urlPathQueryForState = urlPathQueryForState;
    return this;
  }

  build() {
    return new Historian(this);
  }
}

class Historian {
  constructor(options) {
    assertInstance(options, HistorianOptions);

    this._stateHandler = options.stateHandler;
    this._titleForState = options.titleForState;
    this._urlPathQueryForState = options.urlPathQueryForState;
    this._localClone = [null];

    // Assigning stateHandler wrapper directly to window.onpopstate
    // so that creating a new Historian will disable the active one
    window.onpopstate = e => {
      const state = (e && e.state) || window.history.state;
      if (typeof state == 'number' && this._localClone[state]) {
        // Fallback for when there is too much data to save to the state
        this._stateHandler(this._localClone[state]);
      } else if (state) {
        this._stateHandler(state);
      }
    };
  }

  /**
   * restoreState(data = window.history.state)
   * Calls stateHander(data)
   */
  restoreState(data = window.history.state) {
    this._stateHandler(data);
  }

  /**
   * saveState(data, replace = false)
   * Saves data (response object from the Oracle) to history to be retrieved
   * when the browser navigates back. If replace == true, it will use
   * window.replaceState instead of window.pushState to save the history.
   */
  saveState(data, replace = false) {
    const title = this._titleForState(data);
    const url = this._urlPathQueryForState(data);
    const historyState = this._localClone[this._localClone.length - 1]
      ? this._localClone[this._localClone.length - 1]
      : window.history.state;

    if (replace || !stateChanged(data, url, historyState)) {
      try {
        window.history.replaceState(data, title, url);
        this._localClone[this._localClone.length - 1] = null;
      } catch (e) {
        if (e.name === 'DataCloneError' || e.name === 'NS_ERROR_ILLEGAL_VALUE') {
          console.warn('Historian: Too much data to replace the state');
          window.history.replaceState(this._localClone.length - 1, title, url);
          this._localClone[this._localClone.length - 1] = data;
        } else {
          throw e;
        }
      }
    } else {
      try {
        window.history.pushState(data, title, url);
        this._localClone.push(null);
      } catch (e) {
        if (e.name === 'DataCloneError' || e.name === 'NS_ERROR_ILLEGAL_VALUE') {
          console.warn('Historian: Too much data to push the state');
          window.history.pushState(this._localClone.length, title, url);
          this._localClone.push(data);
        } else {
          throw e;
        }
      }
    }
  }
}

export {
  Historian,
  HistorianOptions
};
