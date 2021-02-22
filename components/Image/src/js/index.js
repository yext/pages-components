export function ImageObjectFit(scope = document) {
  for (const container of scope.querySelectorAll(`[data-object-fit]`)) {
    const objectFit = container.dataset.objectFit;
    const objectPosition = container.dataset.objectPosition || 'center';
    const image = container.children[0];

    container.removeAttribute('data-object-fit');
    container.removeAttribute('data-object-position');
    container.setAttribute('class', image.getAttribute('class') || '');
    container.classList.add('ObjectFit-container');
    container.setAttribute('style', image.getAttribute('style') || '');
    container.style.backgroundSize = objectFit == 'none' ? 'auto' : objectFit;
    container.style.backgroundPosition = objectPosition;

    image.setAttribute('class', 'ObjectFit-image');
    image.removeAttribute('style');

    if (image.getAttribute('src')) {
      container.style.backgroundImage = `url("${image.getAttribute('src')}")`;
    }

    if (image.dataset.src) {
      // If the image is being lazy loaded, set the dataset.bg of the wrapper to the image url
      // This will lazy load and set it as a background image
      container.dataset.bg = `url("${image.dataset.src}")`;
    }
  }
}
