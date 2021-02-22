export class Observer {
  constructor (element = document.documentElement) {
    this._el = element;
    this._mutationObserver = undefined;
  }

  add(callback, opts={attributes: true, childList: true}) {
    if (this._mutationObserver) return;
    const observer = new MutationObserver(callback);
    observer.observe(this._el, opts);
    this._mutationObserver = observer;
  }

  remove() {
    if (!this._mutationObserver) return;
    this._mutationObserver.disconnect();
    this._mutationObserver = undefined;
  }
}
