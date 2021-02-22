const outlineStyle = '8px solid red';
const whitelist = [
  '.c-map-with-pins'
];
export class AccessibilityHelpers {
  setAriaProp(element, ariaProp, ariaValue) {
    element.setAttribute(`aria-${ariaProp}`, ariaValue);
  }

  toggleAriaState(element, ariaProp) {
    if (!element.hasAttribute(`aria-${ariaProp}`)) return;
    const currAriaValue = element.getAttribute(`aria-${ariaProp}`);
    const newAriaValue = !(currAriaValue == 'true');
    element.setAttribute(`aria-${ariaProp}`, newAriaValue);
  }

  setTabIndex(target, tabIndex) {
    let els = [];
    if (typeof(target) === 'string') {
      els = document.querySelectorAll(`${selector}`);
    } else if (target instanceof HTMLElement) {
      els = [target];
    } else if (target instanceof NodeList) {
      els = target;
    }

    for (const el of els) {
      el.tabIndex = tabIndex;
    }
  }
}

export const AccessibilityChecks = {
  checkAltTags: function () {
    const accessibilityStyleSheet = document.createElement('style');
    accessibilityStyleSheet.innerHTML = `img:not([alt]) { outline: ${outlineStyle}; }`;
    for (let selector of whitelist) {
      accessibilityStyleSheet.innerHTML += `${selector} img:not([alt]) { outline: none; }`;
    }
    document.head.appendChild(accessibilityStyleSheet);
  }
}
