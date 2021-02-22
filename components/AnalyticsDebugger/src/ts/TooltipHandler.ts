import { Tooltip } from './Tooltip';

let count: number = 0;
let tooltips: object = {};
let instances: Tooltip[] = []; 

class TooltipHandler {
  constructor() {
    throw new Error('Cannot create instance of object');
  }

  static removeAll(): void {
    for (const tooltip of instances) {
      tooltip.remove();
    }
    instances = [];
    tooltips = {};
    count = 0;
  }

  static add (name, element) {
    if (tooltips.hasOwnProperty(name)) {
       let filter = tooltips[name].filter ( e => element == e );
       if (filter.length > 0) return;
       tooltips[name].push(element);
    } else {
      tooltips[name] = [element];
    }

  count++;

    let aTooltip = new Tooltip(
      count.toString(),
      name
    );

    instances.push(aTooltip);

    // element is a, button, input that is being tracked.
    const rect = element.getBoundingClientRect();

    aTooltip.appendTo(document.body);

    const windowBounds = (x1, y1, x2, y2) => {
      return (x1 < 0 || x2 > window.innerWidth) ||
        (y1 < 0 || y2 > document.body.getBoundingClientRect().height);
    };

    for (let i = 0; i < 9; i++) {
      // get base position and set the tooltip
      let position = this.positionFinder(rect, aTooltip, i);
      aTooltip.position(
        position.top,
        position.left
      );

      // check for window bounds
      let withinBounds = !windowBounds(
        aTooltip.getLeft(),
        aTooltip.getTop(),
        aTooltip.getLeft() + aTooltip.getWidth(),
        aTooltip.getTop() + aTooltip.getHeight()
      );

      // if tooltip is not within screen bounds
      if (!withinBounds) continue;

      // check if tooltip overlaps with others.
      let valid = true;
      for (let j = 0; j < instances.length - 1; j++) {
        const tooltip = instances[j];
        if (aTooltip.overlaps(tooltip)) {
          valid = false;
        }
      }
      if (valid) break;
    }

    element.setAttribute('data-tooltip', count);
  }

  static positionFinder (rect, aTooltip, index) {
    let tooltipHeight = aTooltip.getHeight();
    let tooltipWidth = aTooltip.getWidth();

    let left;
    let top;
    switch (index) {
      // case 'top-left': {
      case 0: {
        top = (window.pageYOffset + rect.top - tooltipHeight) + 'px';
        left = (rect.left - tooltipWidth) + 'px';
        break;
      }
      // case 'top-inner-left': {
      case 1: {
        top = (window.pageYOffset + rect.top - tooltipHeight) + 'px';
        left = rect.left + 'px';
        break;
      }
      // case 'top-right': {
      case 2: {
        top = (window.pageYOffset + rect.top - tooltipHeight) + 'px';
        left = rect.right + 'px';
        break;
      }
      // case 'top-inner-right': {
      case 3: {
        top = (window.pageYOffset + rect.top - tooltipHeight) + 'px';
        left = (rect.right - tooltipWidth) + 'px';
        break;
      }
      // case 'bottom-left': {
      case 4: {
        top = (window.pageYOffset + rect.bottom) + 'px';
        left = (rect.left - tooltipWidth) + 'px';
        break;
      }
      // case 'bottom-inner-left': {
      case 5: {
        top = (window.pageYOffset + rect.bottom) + 'px';
        left = rect.left + 'px';
        break;
      }
      // case 'bottom-inner-right': {
      case 6: {
        top = (window.pageYOffset + rect.bottom) + 'px';
        left = (rect.right - tooltipWidth) + 'px';
        break;
      }
      // case 'bottom-right': {
      case 7: {
        top = (window.pageYOffset + rect.bottom) + 'px';
        left = rect.right + 'px';
        break;
      }
      default: {
        top = 0;
        left = 0;
      }
    }

    return {
      top: top,
      left: left
    };
  }
}

export {
  TooltipHandler
}
