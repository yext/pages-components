const blank = "_blank";
const relnoopener = "noopener noreferrer";

class WCAGNewTab {
  wcagify(newWindowAllLinks = false) {
    for (let selector of document.querySelectorAll('a[href^="http"],a[target="_blank"]')){
      if (selector.target === blank || newWindowAllLinks) {
        if (newWindowAllLinks && selector.target !== blank) {
          selector.target = blank;
        }
        selector.rel = relnoopener
        let spanToAppend = this.createTextNode();
        selector.appendChild(spanToAppend);
      }
    }
  }

  createTextNode() {
    const ariaSpan = document.createElement('span');
    const innerText = document.createTextNode('\u00A0Link Opens in New Tab');
    ariaSpan.classList.add('sr-only');
    ariaSpan.classList.add('wcag-new-tab-hover');
    ariaSpan.appendChild(innerText);
    return ariaSpan;
  }
}

const Instance = new WCAGNewTab();

export {
  WCAGNewTab,
  Instance
}
