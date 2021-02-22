import URI from 'urijs';

class GoogleAnalyticsCampaignAutoTracker {
  constructor(options) {
    Object.assign(this, options);

    this.hosts = this.hosts || [];
    this.utmContent = this.utmContent || [];
    this.utmSource = this.utmSource || '';

    if (this.hosts.length == 0) {
      // if there are no hosts and we add params to all links, we could break the deep linking
      // to google maps and uber, among others
      console.error('Please specify at least one host to which clicks should be tracked');
    }
  }

  bind() {
    this.processUtmContent();
    this.processUtmSource();
  }

  processUtmContent() {
    for (let currContent of this.utmContent) {
      let elements = document.querySelectorAll(currContent.selectors.toString());
      let contentValue = currContent.value || '';

      for (let el of elements) {
        if (this.shouldProcess(el, 'utm_content')) {
          let uri = this.getUri(el);
          if (currContent.generator) {
            uri.addSearch("utm_content", currContent.generator.process(el));
          } else {
            uri.addSearch("utm_content", `${contentValue}`);
          }
          el.setAttribute("href", uri.toString());
        }
      };
    }
  }

  processUtmSource() {
    let elements = document.getElementsByTagName('a');

    for (let el of elements) {
      if (this.shouldProcess(el, 'utm_source')) {
        let uri = this.getUri(el);
        uri.addSearch("utm_source", `${this.utmSource}`);
        el.href = uri.toString();
      }
    }
  }

  shouldProcess(el, search) {
    let uri = this.getUri(el);
    let host = uri.host();

    return el.getAttribute("href").length > 0 && this.matchesHosts(host) && !uri.hasSearch(search);
  }

  getUri(el) {
    return URI(el.getAttribute("href"));
  }

  matchesHosts(target) {
    for (let host of this.hosts) {
      if (target.indexOf(host) > -1) {
        return true;
      }
    }

    return false;
  }
}

class GoogleAnalyticsSlugifier {
  constructor(options) {
    Object.assign(this, options);

    this.selectorBlacklist = this.blacklist || [];
    this.mode = this.mode || 'slugClasses';
  }

  process(element) {
    if (this.mode == 'slugClasses') {
      return this.slugClasses(element);
    } else if (this.mode == 'slugText') {
      return this.slugText(element);
    }
  }

  slugClasses(element) {
    const classes = [... element.classList];

    for (let selector of this.selectorBlacklist) {
      let idx = classes.indexOf(selector);
      classes.splice(idx, 1);
    }

    return classes.join("-").toLowerCase();
  }

  slugText(element) {
    return element.innerHTML.toLowerCase().replace(/\s+/g, '-');
  }
}

export {
  GoogleAnalyticsCampaignAutoTracker,
  GoogleAnalyticsSlugifier
};
