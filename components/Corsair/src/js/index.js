import URI from 'urijs';

class Proxy {
  constructor(proxyEndpointBase, proxyUrlParam = 'url') {
    this.proxyEndpointBase = proxyEndpointBase;
    this.proxyUrlParam = proxyUrlParam;
  }

  proxyUrl(url) {
    return new URI(this.proxyEndpointBase).setSearch(this.proxyUrlParam, url).toString();
  }

  buildAssetList(urls) {
    return urls.map(this.proxyUrl.bind(this));
  }

  fetch(urls) {
    let assetUrls = [];

    // Check if fetch parameter is single URL or array of URLs
    if (Array.isArray(urls)) {
      assetUrls = this.buildAssetList(urls);
    } else {
      assetUrls.push(this.proxyUrl(urls));
    }

    return Promise.all(assetUrls.map(assetUrl => fetch(assetUrl)));
  }
}

export {
  Proxy
};
