export class Throttle {
  // adapted from: https://developer.mozilla.org/en-US/docs/Web/Events/resize
  constructor(eventName, customName, scope) {
    this.eventName = eventName;
    this.customName = customName;
    this.scope = scope;
    this.running = false;

    this.listener = () => {
      if (this.running) { return; }
      this.running = true;
      requestAnimationFrame(() => {
        this.scope.dispatchEvent(new CustomEvent(this.customName));
        this.running = false;
      });
    };
  }

  start() {
    this.scope.addEventListener(this.eventName, this.listener);
  }

  end() {
    this.scope.removeEventListener(this.eventName, this.listener);
  }
}
