import { Warn } from './Utils.js';

let SelectorTracking = {};

function GetParams(url) {
  let queries = {};
  let parts = url.split('?');
  if (parts.length == 2) {
    parts[1].split('&').forEach((pair)=>{
      let params = pair.split('=');
      queries[params[0]] = params[1];
    });
  }
  return queries;
}

function CheckAnchorQueries(anchor) {
  if (anchor && anchor.href) {
    let eName = GetParams(anchor.href)['ya-track'];
    if (eName) {
      return eName;
    }
  }
  return false;
}

function SearchElementForSelector(el, s) {
  /* Loop up the DOM tree through parent elements to try to find an element that matches the given selector */
  while (el && (el.tagName && !el.matches(s))) {
    el = el.parentNode;
  }

  if (el && el.tagName && el.matches(s)) {
    return el;
  }

  return null;
}

function CalcEventNameForElement(element) {
  let type = null;
  let trackDetails = null;
  let srcEl = null;

  for (const selector in SelectorTracking) {
    if (!element.matches(selector)) continue;
    trackDetails = SelectorTracking[selector];
  }

  if (!trackDetails) {
    let potentialYaTrackedEl = SearchElementForSelector(element, '[data-ya-track]');
    if (potentialYaTrackedEl) {
      srcEl = potentialYaTrackedEl;
      trackDetails = (potentialYaTrackedEl.dataset ? potentialYaTrackedEl.dataset.yaTrack : potentialYaTrackedEl.getAttribute('data-ya-track'));
    }
  }

  let preventDefaultEvent = SearchElementForSelector(element, '[data-ya-prevent-default]');

  if (!preventDefaultEvent && !trackDetails) {
    let anchor = SearchElementForSelector(element, 'a');
    if (anchor) {
      srcEl = anchor;
      let anchorQuery = CheckAnchorQueries(anchor);
      if (anchorQuery) trackDetails = anchorQuery;
      if (!anchorQuery && !trackDetails) {
        type = 'link';
      }
    }
  }

  if (!preventDefaultEvent && !trackDetails && !type) {
    let button = SearchElementForSelector(element, 'button');
    if (button) {
      srcEl = button;
      type = 'button';
    }
  }

  if (!preventDefaultEvent && !trackDetails && !type) {
    let input = SearchElementForSelector(element, 'input');
    if (input && input.type != 'hidden') {
      srcEl = input;
      type = 'input';
    }
  }

  let dataYaTrack = type || trackDetails;

  if (!dataYaTrack) {
    Warn(element);
    return;
  }

  let scopeAncestors = [];
  while (element && element.tagName) {
    if (element.matches('[data-ya-scope]')) {
      scopeAncestors.push(element);
    }
    element = element.parentNode;
  }

  let tags = [srcEl].concat(scopeAncestors);
  for (const [hierarchyIdx, hierarchyElement] of tags.entries()) {
    let tagVal = (hierarchyIdx == 0) ? dataYaTrack : (hierarchyElement.dataset ? hierarchyElement.dataset.yaScope : hierarchyElement.getAttribute('data-ya-scope'))
    if (tagVal.indexOf('#') > -1) {
      let attributeName = hierarchyIdx == 0 ? 'data-ya-track': 'data-ya-scope';
      let ancestor = (hierarchyIdx + 1 < tags.length) ? tags[hierarchyIdx + 1]: document;
      let siblings = Array.from(ancestor.querySelectorAll(`[${attributeName}='${tagVal}']`));
      for (const [siblingIdx, sibling] of siblings.entries()) {
        if (hierarchyElement == sibling) {
          tagVal = tagVal.replace('#', siblingIdx + 1);
          break;
        }
      }
    }
    tags[hierarchyIdx] = tagVal;
  }

  return tags.reverse().join('_');
};

/**
 * Builds a map of all event names on page.
 */
function CalcEventNameMap(yaInstance) {
  const map = new Map();
  const allLinks = Array.from(document.links);
  const allOtherTracked = Array.from(document.querySelectorAll('button, input, select, textarea'));
  for (const el of allLinks.concat(allOtherTracked)) {
    if (el.tagName.toLowerCase() == 'input' && el.type == 'hidden') continue;
    const name = yaInstance.CalcEventNameForElement(el);
    if (!name) continue;
    if (!map.has(name)) {
      let container = [];
      map.set(name, container);
    }
    const elements = map.get(name);
    elements.push(el);
    map.set(name, elements);
  }
  return map;
}

export {
  SelectorTracking,
  GetParams,
  CheckAnchorQueries,
  SearchElementForSelector,
  CalcEventNameForElement,
  CalcEventNameMap
};
