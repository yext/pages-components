import 'whatwg-fetch'

interface SnifferConfig {
    fetch: string | (() => Element[]);
    check?: (element: Element) => Promise<boolean>;
    fix: (element: Element) => void;
}

export class Sniffer {
  findSmells: (scope?: Element|Document) => Element[];
  smellsBad: (e: Element) => Promise<boolean>;
  deodorize: (e: Element) => void;

  constructor(config: SnifferConfig) {
    if (typeof config.fetch === "string") {
      let queryString: string = config.fetch;
      this.findSmells = (scope = document) => Array.from(scope.querySelectorAll(queryString));
    } else {
      this.findSmells = config.fetch;
    }

    if (config.check) {
      this.smellsBad = config.check;
    } else {
      this.smellsBad = (e: Element) => Promise.resolve(true);
    }

    this.deodorize = config.fix;
  }

  sniff(scope = document): void {
    let allSmells = this.findSmells(scope);
    allSmells.map(smell => this.smellsBad(smell)
                      .then((bad) => {if (bad) this.deodorize(smell)}));
  }
}

export class BadInternalLinkSniffer extends Sniffer {
  constructor(public queryString: string = "a.js-sniff-target", public deleteLink: boolean = false) {
    super({
      fetch: queryString,
      check: (element) => {
        return this.sniffBadLink(element);
      },
      fix: (element) => {
        if (deleteLink) {
          this.removeLink(element);
        } else {
          this.replaceLink(element);
        }
      }
    });
  }

  sniffBadLink(element: Element): Promise<boolean> {
    const init = {method: 'HEAD', credentials: <RequestCredentials>'same-origin'};
    if (!(element).getAttribute('href')) return Promise.resolve(false);
    return fetch((element).getAttribute('href'), init).then((res) => {
      return res.status != 200;
    }).catch(() => false);
  }

  replaceLink(element: Element): void {
    let oldAttributes = Array.from(element.attributes);

    let replacementSpan = document.createElement('span');
    for (let attr of oldAttributes) {
      if ((attr as any).nodeName != 'href') {
        replacementSpan.setAttribute((attr as any).nodeName, (attr as any).nodeValue);
      }
    }
    replacementSpan.innerHTML = element.innerHTML
    element.parentNode.replaceChild(replacementSpan, element);
  }

  removeLink(element: Element): void {
    element.parentNode.removeChild(element);
  }
}
