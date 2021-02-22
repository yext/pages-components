import { AnalyticsDom } from './AnalyticsDom';

class Tooltip extends AnalyticsDom {
  constructor (id: string = '-1', name: string = 'Sample Tooltip') {
    super();

    let tooltip: HTMLElement = document.createElement('div');
    tooltip.classList.add('Tooltip');
    tooltip.setAttribute('tooltip-id', <string> id);

    let tooltipContent = document.createElement('span');
    tooltipContent.textContent = name;

    tooltip.appendChild(tooltipContent);

    this._domElement = tooltip;
    this._domElement.style['visibility'] = 'hidden';
  }

  /**
   * This function will check if the current tooltip is overlapping
   * with another tooltip - we do pixel math to see if any corner intersects
   * another tooltip. The function that calls this will loop through
   * base positions (topLeft, innerLeft, innerRight, topRight...) to see GUESS
   * which "base position" will work the best.
   */
  overlaps (futureNeighbor: Tooltip): boolean {
     const y1 = this.getTop();
     const x1 = this.getLeft();
     const y2 = y1 + this.getHeight();
     const x2 = x1 + this.getWidth();

     const b1 = futureNeighbor.getTop();
     const a1 = futureNeighbor.getLeft();
     const b2 = b1 + futureNeighbor.getHeight();
     const a2 = a1 + futureNeighbor.getWidth();

     const check = (x1, y1, a1, b1, x2, y2, a2, b2) => {
       return (a1 <= x2 && x2 <= a2 && b1 <= y2 && y2 <= b2) ||
        (a1 <= x1 && x1 <= a2 && b1 <= y1 && y1 <= b2) ||
        (a1 <= x1 && x1 <= a2 && b1 <= y2 && y2 <= b2) ||
        (a1 <= x2 && x2 <= a2 && b1 <= y1 && y1 <= b2);
     };

     return check(x1, y1, a1, b1, x2, y2, a2, b2) || check(a1, b1, x1, y1, a2, b2, x2, y2);
  }
}

export {
  Tooltip
}
