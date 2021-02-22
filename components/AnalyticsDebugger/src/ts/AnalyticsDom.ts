export abstract class AnalyticsDom {
  _domElement: HTMLElement

  position (top:string='auto', left:string='auto', bottom:string='auto', right:string='auto') {
    this._domElement.style['top'] = top;
    this._domElement.style['left'] = left;
    this._domElement.style['bottom'] = bottom;
    this._domElement.style['right'] = right;
  }

  appendTo(domElement: HTMLElement = document.body): void {
    domElement.appendChild(this._domElement);
    this._domElement.style['visibility'] = 'visible';
  }

  getHeight (): number {
    return this._domElement.getBoundingClientRect().height;
  }

  getWidth (): number {
    return this._domElement.getBoundingClientRect().width;
  }

  getLeft(): number {
    const left: string = this._domElement.style['left'];
    return parseInt(left, 10);
  }

  getTop(): number {
    const top: string = this._domElement.style['top'];
    return parseInt(top, 10);
  }

  remove(): void {
    this._domElement.remove();
  }
}
