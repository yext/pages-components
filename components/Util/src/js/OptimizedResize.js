import { Throttle } from './Throttle.js';

class OptimizedResize {
  constructor(scope = window) {
    this.eventTypeName = 'optimizedResize';
    this.throttle = new Throttle('resize', this.eventTypeName, scope);
    this.init = false;
  }

  on(cb) {
    if (!this.init) {
      this.init = true;
      this.throttle.start();
    }
    window.addEventListener(this.eventTypeName, cb);
  }

  remove(cb) {
    window.removeEventListener(this.eventTypeName, cb);
  }

  // This will halt the triggering of ALL callbacks added with '.on()'.
  // Only call this if you are sure there are no other functions/classes
  // using this class.
  kill() {
    this.throttle.end();
    this.init = false;
  }
}

export const OptimizedResizeInstance = new OptimizedResize();
