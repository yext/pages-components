function onReady(cb) {
  if (document.readyState === "complete"
       || document.readyState === "loaded"
       || document.readyState === "interactive") {
    cb.bind(this)();
  } else {
    document.addEventListener('DOMContentLoaded', cb.bind(this));
  }
}

 class UserAgent {
  static fromWindow() {
    return new this(window.navigator.userAgent);
  }

  constructor(ua) {
    this.userAgent = ua;
  }

  isGooglePageSpeed() {
    return this.userAgent.indexOf("Google Page Speed Insights") > -1 ||
      this.userAgent.indexOf("Chrome-Lighthouse") > -1;
  }
}

export {
  onReady,
  UserAgent
}
