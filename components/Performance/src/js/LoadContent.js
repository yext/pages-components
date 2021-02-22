/**
 * Insert stylesheet link element into HTML from provided src url
 * @param {string} url
 */
function LoadCSS(url) {
  const style = document.createElement('link');

  style.href = url;
  style.rel = 'stylesheet';
  style.type = 'text/css';

  document.head.appendChild(style);
}

/**
 * Insert script element into HTML from provided src url
 * @param {string} src
 * @param {function} [cb] Function that runs on script load
 */
function LoadScript(src, cb = () => {}) {
  const script = document.createElement('script');

  script.async = true;
  script.onload = cb;
  script.src = src;

  document.head.appendChild(script);
}

export {
  LoadCSS,
  LoadScript
};
