import URI from 'urijs';

const originalReferrerParamName = 'oref';
const originalUrlParamName = 'ourl';

class LostAndFound {
  constructor(url, referrer, {
    destinationUrl,
    isStaging = false,
    pixelUrl,
    siteDomain,
    siteId,
    timeout = 1000
  }) {
    this.currentUrl = new URI(url);
    this.destinationUrl = destinationUrl;
    this.isStaging = isStaging;
    this.pixelUrl = pixelUrl;
    this.siteDomain = siteDomain;
    this.siteId = siteId;
    this.timeout = timeout;

    this.originalUrl = url;
    // If the current URL specifies an original url as a parameter, use it instead
    if((this.currentUrl).hasQuery(originalUrlParamName)) {
      this.originalUrl = this.currentUrl.query(true)[originalUrlParamName];
    }

    // If the current URL specifies an original referrer as a parameter, use it instead
    this.originalReferrer = referrer;
    if((this.currentUrl).hasQuery(originalReferrerParamName)) {
      this.originalReferrer = this.currentUrl.query(true)[originalReferrerParamName];
    }

    this.hooks = [];
  }

  // GENERATOR TODO: Put this in a common util spot since we have multiple copies in the codebase
  once(task) {
    if (!task)
      return;

    let invoked = false;
    return function() {
      if (invoked)
        return;
      invoked = true;
      task();
    }
  }

  // Appends preHooks to test before actually firing the pixel
  preHook(fn) {
    this.hooks.push(fn);
  }

  installBasicHooks() {
    this.preHook(TryLowercase);
    this.preHook(TryParent);
  }

  firePixel(cb) {
    let pixel = new URI(this.pixelUrl);

    pixel.search({
      siteid: this.siteId,
      staging: this.isStaging,
      referrer: this.originalReferrer,
      url: this.originalUrl
    });

    const trackingImage = document.createElement('img');
    trackingImage.src = pixel.href();

    let onceCB = this.once(cb);
    trackingImage.onload = onceCB;
    trackingImage.onerror = onceCB;
    setTimeout(onceCB, this.timeout);
  }

  redirectTo(rawUrl, installTrackingParams = false) {
    let url = new URI(rawUrl);

     // Inherit any params on the current URL
    url.setSearch(this.currentUrl.search(true));
    url.hash(this.currentUrl.hash());

    if (installTrackingParams) {
      url.setSearch(originalUrlParamName, this.originalUrl);
      url.setSearch(originalReferrerParamName, this.originalReferrer);
    } else {
      // Remove tracking params in case the current url had them
      url.removeSearch(originalUrlParamName);
      url.removeSearch(originalReferrerParamName);
    }

    window.location.replace(url.href());
  }

  run() {
    let hookUrl = '';
    for (let hook of this.hooks) {
      hookUrl = hook({
        currentUrl: this.currentUrl.href(),
        siteDomain: this.siteDomain,
      });
      if(hookUrl != '') {
        this.redirectTo(hookUrl, true);
        return;
      }
    }

    this.firePixel(() => {
      if (this.destinationUrl) {
        // No need to preserve params going to our final destination.  While
        // its possible that location will 404, that is assumed to be programmer
        // error.
        this.redirectTo(this.destinationUrl, false);
      }
    });
  }
}

function TryLowercase({ currentUrl }) {
  let url = new URI(currentUrl);

  if (url.pathname(true).toLowerCase() != url.pathname(true)) {
    url.pathname(url.pathname(true).toLowerCase());
    return url.href();
  }

  return '';
}

// GENERATOR TODO: validate behavior of this on staging for reverse proxy sites OR
// in prod on the origin domain (not the RP with the folder)
// GENERATOR TODO: we might want to allow for /some/parent/path.html -> /some/parent.html,
// perhaps we can extend this to allow for file extensions
function TryParent({ currentUrl, siteDomain }) {
  // Doesn't change typical subdomains (a.foo.com == a.foo.com/) but allows
  // URI.js to interpret subdirectory reverse proxies to be interpreted as a
  // directory.
  siteDomain = `http://${siteDomain}/`;

  let url = new URI(currentUrl);
  let hostUrl = new URI(siteDomain);

  // Already at the root, can't go any further
  if (url.directory() == '/') {
    return '';
  }

  // At the reverse proxy's root, can't go any further
  if (url.hostname() == hostUrl.hostname() && url.directory() == hostUrl.directory()) {
    return '';
  }

  // Navigate "up" one-level
  url.pathname(url.directory(true));

  return url.href();
}

export {
  LostAndFound,
  TryLowercase,
  TryParent
};
