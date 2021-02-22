export class RunIfVisible {
  /**
    * @param {object} target - DOM Element to observe
    * @param {function} thingToRun - Function to execute when target is visible
    * @param {object} options - The options to pass to the IntersectionObserver as defined by https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
    * @param {object} options.root - The element that is used as the viewport for checking visibility of the target
    * @param {string} options.rootMargin - Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px"
    * @param {number/array} options.threshold - Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be executed.
   */
  static runIfTargetVisible(target, thingToRun, options = {}) {
    if (!target) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      thingToRun();
      return;
    }

    const ObserveOnce = (obs, entries) => {
      entries.forEach((entry) => {
        if(!entry.isIntersecting) return;
        obs.disconnect();
        thingToRun();
      });
    }

    const observer = new IntersectionObserver((entries) => {
      ObserveOnce(observer, entries);
    }, options);

    observer.observe(target);
  }

  static lazyLoadImages(selector = "", options = {}) {
    for (let el of document.querySelectorAll(`${selector}[data-src]`)) {
      this.runIfTargetVisible(el, () => {
        el.src = el.dataset.src;
        el.classList.add('js-lazy-loaded');
      }, options);
    }
    for (let el of document.querySelectorAll(`${selector}[data-srcset]`)) {
      this.runIfTargetVisible(el, () => {
        el.srcset = el.dataset.srcset;
        el.classList.add('js-lazy-loaded');
      }, options);
    }
    for (let el of document.querySelectorAll(`${selector}[data-bg]`)) {
      this.runIfTargetVisible(el, () => {
        el.style.backgroundImage = el.dataset.bg;
        el.classList.add('js-lazy-loaded');
      }, options);
    }
  }
}
