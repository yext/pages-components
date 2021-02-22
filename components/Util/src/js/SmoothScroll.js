/**
 * @typedef timingFunction
 * @function
 * @param {number} t A number within [0, 1] representing the percentage of time elapsed
 * @returns {number} A number within [0, 1] representing the progress of the animation
 */

/**
 * @constant {timingFunction} Timing.LINEAR
 */
const Timing = {
  LINEAR: t => t
};

/**
 * @param {HTMLElement} el The element to scroll
 * @param {number} scrollDist The number of pixels to scroll vertically
 * @param {number} duration The duration in miliseconds
 * @param {Object} [options={}]
 * @param {number} [intervalLength=10] Number of miliseconds between scroll position updates
 * @param {function} [timing=Timing.LINEAR] Timing function used for scroll animation
 */
function smoothScroll(el, scrollDist, duration, {
  intervalLength = 10,
  timing = Timing.LINEAR
} = {}) {
  const scrollTop = el.scrollTop;
  let timeElapsed = 0;

  const interval = setInterval(() => {
    timeElapsed += intervalLength;
    el.scrollTop = scrollTop + scrollDist * timing(timeElapsed / duration);

    if (timeElapsed > duration) {
      clearInterval(interval);
      el.scrollTop = scrollTop + scrollDist;
    }
  }, intervalLength);
}

export {
  Timing,
  smoothScroll
};
